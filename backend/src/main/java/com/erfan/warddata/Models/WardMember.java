package com.erfan.warddata.Models;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("WARD_MEMBER")
public class WardMember extends User {
}
