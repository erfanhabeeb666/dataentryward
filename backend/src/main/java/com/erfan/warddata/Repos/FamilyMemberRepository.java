package com.erfan.warddata.Repos;

import com.erfan.warddata.Models.FamilyMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FamilyMemberRepository extends JpaRepository<FamilyMember, Long> {
    List<FamilyMember> findByHouseholdId(Long householdId);

    @Query("SELECT fm.gender, COUNT(fm) FROM FamilyMember fm JOIN Household h ON fm.householdId = h.id WHERE h.wardId = :wardId GROUP BY fm.gender")
    List<Object[]> countByGenderAndWardId(Long wardId);

    @Query("SELECT COUNT(fm) FROM FamilyMember fm JOIN Household h ON fm.householdId = h.id WHERE h.wardId = :wardId AND fm.seniorCitizenFlag = true")
    long countSeniorsByWardId(Long wardId);

    @Query("SELECT COUNT(fm) FROM FamilyMember fm JOIN Household h ON fm.householdId = h.id WHERE h.wardId = :wardId AND fm.disabilityFlag = true")
    long countDisabledByWardId(Long wardId);
}
