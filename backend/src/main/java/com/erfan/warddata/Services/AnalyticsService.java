package com.erfan.warddata.Services;

import com.erfan.warddata.Dto.WardAnalyticsDto;
import com.erfan.warddata.Enums.Gender;
import com.erfan.warddata.Enums.RationCardType;
import com.erfan.warddata.Repos.FamilyMemberRepository;
import com.erfan.warddata.Repos.HouseholdRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnalyticsService {
    private final HouseholdRepository householdRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final com.erfan.warddata.Repos.WardRepository wardRepository;
    private final com.erfan.warddata.Repos.UserRepository userRepository;

    public AnalyticsService(HouseholdRepository householdRepository,
            FamilyMemberRepository familyMemberRepository,
            com.erfan.warddata.Repos.WardRepository wardRepository,
            com.erfan.warddata.Repos.UserRepository userRepository) {
        this.householdRepository = householdRepository;
        this.familyMemberRepository = familyMemberRepository;
        this.wardRepository = wardRepository;
        this.userRepository = userRepository;
    }

    public com.erfan.warddata.Dto.GlobalStatsDto getGlobalStats() {
        com.erfan.warddata.Dto.GlobalStatsDto dto = new com.erfan.warddata.Dto.GlobalStatsDto();
        dto.setTotalWards(wardRepository.count());
        dto.setTotalUsers(userRepository.count());
        dto.setTotalHouseholds(householdRepository.count());
        dto.setTotalPopulation(familyMemberRepository.count());
        dto.setActiveAgents(userRepository.findByUserType(com.erfan.warddata.Enums.UserType.AGENT).size()); // Simple
                                                                                                            // approach
        return dto;
    }

    public WardAnalyticsDto getWardAnalytics(Long wardId) {
        WardAnalyticsDto dto = new WardAnalyticsDto();
        wardRepository.findById(wardId).ifPresent(w -> dto.setWardName(w.getName()));

        dto.setTotalHouseholds(householdRepository.countByWardId(wardId));
        dto.setVisitedHouseholds(householdRepository.countVisitedByWardId(wardId));
        dto.setNotVisitedHouseholds(dto.getTotalHouseholds() - dto.getVisitedHouseholds());

        List<Object[]> rationStats = householdRepository.countByRationCardType(wardId);
        for (Object[] row : rationStats) {
            RationCardType type = (RationCardType) row[0];
            long count = (long) row[1];
            if (type == RationCardType.APL)
                dto.setAplCount(count);
            else if (type == RationCardType.BPL)
                dto.setBplCount(count);
            else if (type == RationCardType.AAY)
                dto.setAayCount(count);
        }

        List<Object[]> genderStats = familyMemberRepository.countByGenderAndWardId(wardId);
        long totalPop = 0;
        for (Object[] row : genderStats) {
            Gender gender = (Gender) row[0];
            long count = (long) row[1];
            totalPop += count;
            if (gender == Gender.MALE)
                dto.setMaleCount(count);
            else if (gender == Gender.FEMALE)
                dto.setFemaleCount(count);
            else
                dto.setOtherGenderCount(count);
        }
        dto.setTotalPopulation(totalPop);

        dto.setSeniorCitizens(familyMemberRepository.countSeniorsByWardId(wardId));
        dto.setDisabledPersons(familyMemberRepository.countDisabledByWardId(wardId));

        return dto;
    }
}
