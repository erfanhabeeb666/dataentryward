package com.erfan.warddata.Services;

import com.erfan.warddata.Enums.VisitStatus;
import com.erfan.warddata.Models.FamilyMember;
import com.erfan.warddata.Models.Household;
import com.erfan.warddata.Repos.FamilyMemberRepository;
import com.erfan.warddata.Repos.HouseholdRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Service
public class HouseholdService {

    private final HouseholdRepository householdRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final AuditLogService auditLogService;

    public HouseholdService(HouseholdRepository householdRepository, FamilyMemberRepository familyMemberRepository,
            AuditLogService auditLogService) {
        this.householdRepository = householdRepository;
        this.familyMemberRepository = familyMemberRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public Household createHousehold(Long agentId, Long wardId, Household household) {
        household.setWardId(wardId);
        household.setCreatedByAgentId(agentId);
        household.setVisitStatus(VisitStatus.VISITED);
        household.setVisitedAt(Timestamp.from(Instant.now()));

        Household saved = householdRepository.save(household);
        auditLogService.log(agentId, "CREATE", "HOUSEHOLD", saved.getId(), wardId,
                "Created household " + saved.getHouseNumber());
        return saved;
    }

    @Transactional
    public Household updateHousehold(Long agentId, Long householdId, Household details) {
        Household household = householdRepository.findById(householdId)
                .orElseThrow(() -> new RuntimeException("Household not found"));
        // Update logic
        household.setHouseNumber(details.getHouseNumber());
        household.setLandmark(details.getLandmark());
        household.setFullAddress(details.getFullAddress());
        household.setRationCardNumber(details.getRationCardNumber());
        household.setRationCardType(details.getRationCardType());
        household.setLatitude(details.getLatitude());
        household.setLongitude(details.getLongitude());
        household.setVisitStatus(details.getVisitStatus());

        Household updated = householdRepository.save(household);
        auditLogService.log(agentId, "UPDATE", "HOUSEHOLD", updated.getId(), updated.getWardId(),
                "Updated household " + updated.getHouseNumber());
        return updated;
    }

    public Household getHousehold(Long id) {
        return householdRepository.findById(id).orElseThrow(() -> new RuntimeException("Household not found"));
    }

    public Page<Household> getHouseholdsInWard(Long wardId, Pageable pageable) {
        return householdRepository.findByWardId(wardId, pageable);
    }

    // Family Members
    @Transactional
    public FamilyMember addFamilyMember(Long agentId, Long householdId, FamilyMember member) {
        Household household = getHousehold(householdId);
        member.setHouseholdId(householdId);
        FamilyMember saved = familyMemberRepository.save(member);

        auditLogService.log(agentId, "CREATE", "FAMILY_MEMBER", saved.getId(), household.getWardId(),
                "Added member " + saved.getFullName());
        return saved;
    }

    @Transactional
    public FamilyMember updateFamilyMember(Long agentId, Long memberId, FamilyMember details) {
        FamilyMember member = familyMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        Household household = getHousehold(member.getHouseholdId());

        member.setFullName(details.getFullName());
        member.setGender(details.getGender());
        member.setDateOfBirth(details.getDateOfBirth());
        member.setRelationshipToHead(details.getRelationshipToHead());
        member.setEducation(details.getEducation());
        member.setOccupation(details.getOccupation());
        member.setMonthlyIncome(details.getMonthlyIncome());
        member.setAadhaarNumber(details.getAadhaarNumber());
        member.setMobileNumber(details.getMobileNumber());
        member.setDisabilityFlag(details.getDisabilityFlag());
        member.setSeniorCitizenFlag(details.getSeniorCitizenFlag());

        FamilyMember updated = familyMemberRepository.save(member);
        auditLogService.log(agentId, "UPDATE", "FAMILY_MEMBER", updated.getId(), household.getWardId(),
                "Updated member " + updated.getFullName());
        return updated;
    }

    public List<FamilyMember> getFamilyMembers(Long householdId) {
        return familyMemberRepository.findByHouseholdId(householdId);
    }
}
