package com.erfan.warddata.Dto;

import lombok.Data;

@Data
public class WardAnalyticsDto {
    private long totalHouseholds;
    private long visitedHouseholds;
    private long notVisitedHouseholds;
    private long verifiedHouseholds;

    private long aplCount;
    private long bplCount;
    private long aayCount;

    // Population
    private long totalPopulation;
    private long maleCount;
    private long femaleCount;
    private long otherGenderCount;

    // Vulnerable groups
    private long seniorCitizens;
    private long disabledPersons;
}
