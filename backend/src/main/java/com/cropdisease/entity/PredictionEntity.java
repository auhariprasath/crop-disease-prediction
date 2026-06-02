package com.cropdisease.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "predictions")
public class PredictionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_time", nullable = false)
    @JsonProperty("created_at")
    private LocalDateTime dateTime;

    @Column(name = "crop_name", nullable = false)
    private String cropName;

    @Column(name = "disease", nullable = false)
    private String disease;

    @Column(name = "confidence", nullable = false)
    private Double confidence;

    @Column(name = "report_pdf")
    private String reportPdf;

    public PredictionEntity() {}

    public PredictionEntity(LocalDateTime dateTime, String cropName, String disease, Double confidence) {
        this.dateTime = dateTime;
        this.cropName = cropName;
        this.disease = disease;
        this.confidence = confidence;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getDateTime() { return dateTime; }
    public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }

    public String getCropName() { return cropName; }
    public void setCropName(String cropName) { this.cropName = cropName; }

    public String getDisease() { return disease; }
    public void setDisease(String disease) { this.disease = disease; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public String getReportPdf() { return reportPdf; }
    public void setReportPdf(String reportPdf) { this.reportPdf = reportPdf; }
}
