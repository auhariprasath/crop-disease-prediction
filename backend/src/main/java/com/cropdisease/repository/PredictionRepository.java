package com.cropdisease.repository;

import com.cropdisease.entity.PredictionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PredictionRepository extends JpaRepository<PredictionEntity, Long> {

    @Query("SELECT p FROM PredictionEntity p WHERE " +
           "LOWER(p.cropName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.disease) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "ORDER BY p.dateTime DESC")
    Page<PredictionEntity> searchByCropNameOrDisease(@Param("search") String search, Pageable pageable);

    Page<PredictionEntity> findAllByOrderByDateTimeDesc(Pageable pageable);
}
