package com.cropdisease;

import com.cropdisease.entity.PredictionEntity;
import com.cropdisease.repository.PredictionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PredictionService {

    private static final Logger log = LoggerFactory.getLogger(PredictionService.class);

    @Value("${python.path:python3}")
    private String pythonPath;

    @Value("${scripts.dir:backend/scripts}")
    private String scriptsDir;

    private final PredictionRepository predictionRepository;

    public PredictionService(PredictionRepository predictionRepository) {
        this.predictionRepository = predictionRepository;
    }

    public String predict(MultipartFile file) throws Exception {
        Path temp = Files.createTempFile("crop-", ".jpg");
        file.transferTo(temp.toFile());

        try {
            String scriptPath = scriptsDir + File.separator + "predict.py";

            log.info("Running: {} {} {}", pythonPath, scriptPath, temp.toAbsolutePath());

            ProcessBuilder pb = new ProcessBuilder(pythonPath, scriptPath, temp.toAbsolutePath().toString());
            pb.directory(new File("."));

            Process process = pb.start();
            String output;
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
                 BufferedReader errReader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
                output = sb.toString();
                StringBuilder errSb = new StringBuilder();
                while ((line = errReader.readLine()) != null) {
                    errSb.append(line);
                }
                if (errSb.length() > 0) log.info("Python stderr: {}", errSb);
            }

            int exitCode = process.waitFor();
            log.info("Python output: {}", output);

            if (exitCode != 0) {
                throw new RuntimeException("Python script failed with exit code " + exitCode + ": " + output);
            }

            return output;
        } finally {
            Files.deleteIfExists(temp);
        }
    }

    public PredictionEntity savePrediction(String cropName, String disease, Double confidence) {
        PredictionEntity entity = new PredictionEntity(
                LocalDateTime.now(),
                cropName,
                disease,
                confidence
        );
        PredictionEntity saved = predictionRepository.save(entity);
        log.info("Saved prediction {} to database", saved.getId());
        return saved;
    }

    public Page<PredictionEntity> getHistory(int page, int limit, String search) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        if (search != null && !search.trim().isEmpty()) {
            return predictionRepository.searchByCropNameOrDisease(search.trim(), pageable);
        }
        return predictionRepository.findAllByOrderByDateTimeDesc(pageable);
    }

    public Optional<PredictionEntity> getPredictionById(Long id) {
        return predictionRepository.findById(id);
    }

    public void updateReportPdf(Long id, String reportPdfPath) {
        predictionRepository.findById(id).ifPresent(entity -> {
            entity.setReportPdf(reportPdfPath);
            predictionRepository.save(entity);
        });
    }
}
