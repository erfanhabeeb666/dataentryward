package com.erfan.warddata.Repos;

import com.erfan.warddata.Models.Household;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HouseholdRepository extends JpaRepository<Household, Long> {
    Page<Household> findByWardId(Long wardId, Pageable pageable);

    // For Export
    List<Household> findAllByWardId(Long wardId);

    // Analytics queries
    @Query("SELECT COUNT(h) FROM Household h WHERE h.wardId = :wardId")
    long countByWardId(Long wardId);

    @Query("SELECT COUNT(h) FROM Household h WHERE h.wardId = :wardId AND h.visitStatus <> 'NOT_VISITED'")
    long countVisitedByWardId(Long wardId);

    @Query("SELECT h.rationCardType, COUNT(h) FROM Household h WHERE h.wardId = :wardId GROUP BY h.rationCardType")
    List<Object[]> countByRationCardType(Long wardId);
}
