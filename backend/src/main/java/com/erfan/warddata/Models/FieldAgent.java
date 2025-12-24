package com.erfan.warddata.Models;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("FIELD_AGENT")
public class FieldAgent extends User {
}
