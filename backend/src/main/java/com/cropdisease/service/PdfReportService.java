package com.cropdisease.service;

import com.cropdisease.entity.PredictionEntity;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;

@Service
public class PdfReportService {

    private static final Logger log = LoggerFactory.getLogger(PdfReportService.class);

    @Value("${app.reports.dir:../reports}")
    private String reportsDir;

    public String generateReport(PredictionEntity prediction) throws IOException {
        Path dirPath = Paths.get(reportsDir).toAbsolutePath().normalize();
        Files.createDirectories(dirPath);

        String fileName = "disease_report_" + prediction.getId() + ".pdf";
        Path filePath = dirPath.resolve(fileName);

        try (FileOutputStream fos = new FileOutputStream(filePath.toFile());
             PdfDocument pdfDoc = new PdfDocument(new PdfWriter(fos));
             Document document = new Document(pdfDoc)) {

            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            document.add(new Paragraph("Crop Disease Prediction Report")
                    .setFontSize(20).setBold());
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Generated: " + prediction.getDateTime().format(dtf))
                    .setFontSize(11));
            document.add(new Paragraph(" "));

            Table table = new Table(new float[]{1, 2});
            table.setWidth(UnitValue.createPercentValue(100));

            table.addHeaderCell(new Cell().add(new Paragraph("Field").setBold()));
            table.addHeaderCell(new Cell().add(new Paragraph("Value").setBold()));

            table.addCell(new Cell().add(new Paragraph("Crop Name")));
            table.addCell(new Cell().add(new Paragraph(prediction.getCropName())));

            table.addCell(new Cell().add(new Paragraph("Predicted Disease")));
            table.addCell(new Cell().add(new Paragraph(prediction.getDisease())));

            table.addCell(new Cell().add(new Paragraph("Confidence Score")));
            table.addCell(new Cell().add(new Paragraph(String.format("%.2f%%", prediction.getConfidence()))));

            table.addCell(new Cell().add(new Paragraph("Severity Level")));
            table.addCell(new Cell().add(new Paragraph(determineSeverity(prediction))));

            table.addCell(new Cell().add(new Paragraph("Prediction Date")));
            table.addCell(new Cell().add(new Paragraph(prediction.getDateTime().format(dtf))));

            document.add(table);

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Treatment Recommendation")
                    .setFontSize(14).setBold());
            document.add(new Paragraph(getTreatmentSuggestion(prediction.getDisease()))
                    .setFontSize(11));

            document.add(new Paragraph(" "));
            document.add(new Paragraph(
                    "Disclaimer: This is an AI-generated prediction. " +
                    "Always consult with agricultural experts for accurate diagnosis and treatment.")
                    .setFontSize(9).setItalic());
        }

        return filePath.toAbsolutePath().toString();
    }

    public String determineSeverity(PredictionEntity prediction) {
        if (prediction.getDisease().toLowerCase().contains("healthy")) {
            return "Low";
        }
        double conf = prediction.getConfidence();
        if (conf >= 80) return "High";
        if (conf >= 60) return "Moderate";
        return "Low";
    }

    public String getTreatmentSuggestion(String disease) {
        String d = disease.toLowerCase();
        if (d.contains("healthy")) {
            return "No treatment needed. The crop appears healthy. Continue regular maintenance.";
        }
        if (d.contains("bacterial") || d.contains("bacteria") || d.contains("spot")) {
            return "Apply copper-based fungicides or bactericides. Remove and destroy affected leaves. " +
                   "Avoid overhead irrigation to reduce spread. Practice crop rotation.";
        }
        if (d.contains("powdery_mildew") || d.contains("mildew")) {
            return "Apply sulfur-based or potassium bicarbonate fungicides. Ensure proper air circulation " +
                   "by pruning dense foliage. Avoid high nitrogen fertilizers.";
        }
        if (d.contains("rust")) {
            return "Apply fungicides containing chlorothalonil or mancozeb. Remove infected leaves. " +
                   "Plant resistant varieties in future seasons.";
        }
        if (d.contains("early_blight") || d.contains("late_blight") || d.contains("blight")) {
            return "Apply fungicides (chlorothalonil, mancozeb, or copper-based). Remove infected foliage. " +
                   "Ensure proper spacing for air circulation. Mulch around plants to prevent soil splash.";
        }
        if (d.contains("scab")) {
            return "Apply fungicides containing captan or sulfur. Rake and destroy fallen leaves. " +
                   "Prune to improve air circulation.";
        }
        if (d.contains("mold") || d.contains("leaf_mold")) {
            return "Reduce humidity and improve ventilation. Apply fungicides. " +
                   "Avoid overhead watering and remove affected leaves.";
        }
        if (d.contains("virus") || d.contains("mosaic") || d.contains("curl")) {
            return "Remove and destroy infected plants immediately to prevent spread. " +
                   "Control insect vectors (aphids, whiteflies) with insecticidal soap or neem oil. " +
                   "Use virus-free seeds and resistant varieties.";
        }
        if (d.contains("mite") || d.contains("spider")) {
            return "Apply miticides or insecticidal soap. Introduce predatory mites. " +
                   "Keep plants well-watered to reduce stress. Remove heavily infested leaves.";
        }
        if (d.contains("scorch") || d.contains("leaf_scorch")) {
            return "Apply fungicides containing copper. Remove affected leaves. " +
                   "Ensure adequate watering and avoid water stress.";
        }
        return "Consult with local agricultural extension office or plant pathologist " +
               "for specific treatment recommendations based on your region and crop variety.";
    }
}
