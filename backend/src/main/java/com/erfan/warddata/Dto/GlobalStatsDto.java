package com.erfan.warddata.Dto;

import lombok.Data;

@Data
public class GlobalStatsDto {
    private long totalWards;
    private long totalUsers;
    private long totalHouseholds;
    private long totalPopulation;
    private long activeAgents;
}
