package com.erfan.warddata.Models;

import com.erfan.warddata.Enums.RationCardType;
import com.erfan.warddata.Enums.VisitStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Entity
@Table(name = "households")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Household {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ward_id", nullable = false)
    private Long wardId;

    @Column(name = "house_number")
    private String houseNumber;

    private String landmark;

    @Column(name = "full_address")
    private String fullAddress;

    @Column(name = "ration_card_number")
    private String rationCardNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "ration_card_type")
    private RationCardType rationCardType;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Enumerated(EnumType.STRING)
    @Column(name = "visit_status")
    private VisitStatus visitStatus;

    @Column(name = "visited_at")
    private Timestamp visitedAt;

    @Column(name = "created_by_agent_id")
    private Long createdByAgentId;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Timestamp updatedAt;
}
