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

    public AnalyticsService(HouseholdRepository householdRepository, FamilyMemberRepository familyMemberRepository) {
        this.householdRepository = householdRepository;
        this.familyMemberRepository = familyMemberRepository;
    }

    public WardAnalyticsDto getWardAnalytics(Long wardId) {
        WardAnalyticsDto dto = new WardAnalyticsDto();

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
