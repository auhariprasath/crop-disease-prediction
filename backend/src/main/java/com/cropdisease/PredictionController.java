package com.cropdisease;

import com.cropdisease.entity.PredictionEntity;
import com.cropdisease.service.PdfReportService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
public class PredictionController {

    private static final Logger log = LoggerFactory.getLogger(PredictionController.class);

    private final PredictionService predictionService;
    private final PdfReportService pdfReportService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PredictionController(PredictionService predictionService, PdfReportService pdfReportService) {
        this.predictionService = predictionService;
        this.pdfReportService = pdfReportService;
    }

    @PostMapping("/api/predict")
    public ResponseEntity<Map<String, Object>> predict(@RequestParam("image") MultipartFile image) {
        if (image == null || image.isEmpty()) {
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("status", "error");
            err.put("message", "No image uploaded");
            return ResponseEntity.badRequest().body(err);
        }

        try {
            String json = predictionService.predict(image);
            Map<String, Object> result = objectMapper.readValue(json, Map.class);

            if ("success".equals(result.get("status"))) {
                String cropName = (String) result.get("crop_name");
                String disease = (String) result.get("disease");
                Object confidenceObj = result.get("confidence");
                Double confidence = confidenceObj instanceof Number ? ((Number) confidenceObj).doubleValue() : 0.0;

                PredictionEntity saved = predictionService.savePrediction(cropName, disease, confidence);

                result.put("id", saved.getId());
                result.put("severity", pdfReportService.determineSeverity(saved));
                result.put("treatment", pdfReportService.getTreatmentSuggestion(disease));
                result.put("created_at", saved.getDateTime().toString());
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("status", "error");
            err.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
    }

    @GetMapping("/api/history")
    public ResponseEntity<Map<String, Object>> getHistory(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "") String search) {

        Map<String, Object> response = new LinkedHashMap<>();
        try {
            Page<PredictionEntity> historyPage = predictionService.getHistory(page, limit, search);

            List<Map<String, Object>> predictions = historyPage.getContent().stream()
                    .map(p -> {
                        Map<String, Object> item = new LinkedHashMap<>();
                        item.put("id", p.getId());
                        item.put("created_at", p.getDateTime().toString());
                        item.put("crop_name", p.getCropName());
                        item.put("disease", p.getDisease());
                        item.put("confidence", p.getConfidence());
                        item.put("severity", pdfReportService.determineSeverity(p));
                        item.put("report_pdf", p.getReportPdf());
                        return item;
                    })
                    .collect(Collectors.toList());

            response.put("predictions", predictions);
            response.put("totalPages", historyPage.getTotalPages());
            response.put("totalElements", historyPage.getTotalElements());
            response.put("currentPage", page);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching history: {}", e.getMessage(), e);
            response.put("predictions", List.of());
            response.put("totalPages", 1);
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/api/report/{id}")
    public ResponseEntity<byte[]> getReport(@PathVariable Long id) {
        try {
            PredictionEntity prediction = predictionService.getPredictionById(id)
                    .orElse(null);

            if (prediction == null) {
                log.warn("Report requested for non-existent prediction id: {}", id);
                return ResponseEntity.notFound().build();
            }

            String reportPath = prediction.getReportPdf();

            if (reportPath == null || !new File(reportPath).exists()) {
                reportPath = pdfReportService.generateReport(prediction);
                predictionService.updateReportPdf(id, reportPath);
            }

            Path filePath = Path.of(reportPath);
            byte[] pdfBytes = Files.readAllBytes(filePath);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "disease_report_" + id + ".pdf");

            return ResponseEntity.ok().headers(headers).body(pdfBytes);
        } catch (Exception e) {
            log.error("Error generating report for id {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> res = new LinkedHashMap<>();
        res.put("status", "ok");
        return ResponseEntity.ok(res);
    }
}
