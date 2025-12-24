package com.erfan.warddata.Models;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("AGENT")
public class FieldAgent extends User {
}
