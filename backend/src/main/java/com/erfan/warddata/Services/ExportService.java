package com.erfan.warddata.Services;

import com.erfan.warddata.Models.FamilyMember;
import com.erfan.warddata.Models.Household;
import com.erfan.warddata.Repos.FamilyMemberRepository;
import com.erfan.warddata.Repos.HouseholdRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class ExportService {

    private final HouseholdRepository householdRepository;
    private final FamilyMemberRepository familyMemberRepository;

    public ExportService(HouseholdRepository householdRepository, FamilyMemberRepository familyMemberRepository) {
        this.householdRepository = householdRepository;
        this.familyMemberRepository = familyMemberRepository;
    }

    public byte[] exportWardDataToExcel(Long wardId) {
        List<Household> households = householdRepository.findAllByWardId(wardId);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Ward Data");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] columns = {
                    "Household ID", "Ward ID", "House No", "Landmark", "Address",
                    "Ration Card", "RC Type", "Visit Status", "Visited At", "Latitude", "Longitude", "Updated At",
                    "Member ID", "Name", "Gender", "DOB", "Relation", "Education", "Occupation", "Income", "Aadhaar",
                    "Mobile", "Disability", "Senior Citizen", "Member Updated At"
            };

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                CellStyle style = workbook.createCellStyle();
                org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
                headerFont.setBold(true);
                style.setFont(headerFont);
                cell.setCellStyle(style);
            }

            int rowIdx = 1;

            for (Household h : households) {
                List<FamilyMember> members = familyMemberRepository.findByHouseholdId(h.getId());

                if (members.isEmpty()) {
                    Row row = sheet.createRow(rowIdx++);
                    fillHouseholdData(row, h);
                } else {
                    for (FamilyMember m : members) {
                        Row row = sheet.createRow(rowIdx++);
                        fillHouseholdData(row, h);

                        // Member Data
                        row.createCell(12).setCellValue(m.getId());
                        row.createCell(13).setCellValue(m.getFullName());
                        row.createCell(14).setCellValue(m.getGender() != null ? m.getGender().name() : "");
                        row.createCell(15)
                                .setCellValue(m.getDateOfBirth() != null ? m.getDateOfBirth().toString() : "");
                        row.createCell(16).setCellValue(m.getRelationshipToHead());
                        row.createCell(17).setCellValue(m.getEducation());
                        row.createCell(18).setCellValue(m.getOccupation());
                        row.createCell(19)
                                .setCellValue(m.getMonthlyIncome() != null ? m.getMonthlyIncome().toString() : "");
                        row.createCell(20).setCellValue(m.getAadhaarNumber());
                        row.createCell(21).setCellValue(m.getMobileNumber());
                        row.createCell(22).setCellValue(Boolean.TRUE.equals(m.getDisabilityFlag()) ? "Yes" : "No");
                        row.createCell(23).setCellValue(Boolean.TRUE.equals(m.getSeniorCitizenFlag()) ? "Yes" : "No");
                        row.createCell(24).setCellValue(m.getUpdatedAt() != null ? m.getUpdatedAt().toString() : "");
                    }
                }
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export Excel", e);
        }
    }

    private void fillHouseholdData(Row row, Household h) {
        row.createCell(0).setCellValue(h.getId());
        row.createCell(1).setCellValue(h.getWardId());
        row.createCell(2).setCellValue(h.getHouseNumber());
        row.createCell(3).setCellValue(h.getLandmark());
        row.createCell(4).setCellValue(h.getFullAddress());
        row.createCell(5).setCellValue(h.getRationCardNumber());
        row.createCell(6).setCellValue(h.getRationCardType() != null ? h.getRationCardType().name() : "");
        row.createCell(7).setCellValue(h.getVisitStatus() != null ? h.getVisitStatus().name() : "");
        row.createCell(8).setCellValue(h.getVisitedAt() != null ? h.getVisitedAt().toString() : "");
        row.createCell(9).setCellValue(h.getLatitude() != null ? h.getLatitude().toString() : "");
        row.createCell(10).setCellValue(h.getLongitude() != null ? h.getLongitude().toString() : "");
        row.createCell(11).setCellValue(h.getUpdatedAt() != null ? h.getUpdatedAt().toString() : "");
    }

    public byte[] exportWardDataToPdf(Long wardId) {
        List<Household> households = householdRepository.findAllByWardId(wardId);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(com.lowagie.text.PageSize.A4.rotate()); // Landscape
            PdfWriter.getInstance(document, out);
            document.open();

            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
            fontTitle.setSize(18);
            Paragraph title = new Paragraph("Ward Data Report - Ward " + wardId, fontTitle);
            title.setAlignment(Paragraph.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            Font fontSection = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
            fontSection.setSize(11);

            Font fontLabel = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
            fontLabel.setSize(9);

            Font fontNormal = FontFactory.getFont(FontFactory.HELVETICA);
            fontNormal.setSize(9);

            for (Household h : households) {
                // Household Header Section
                PdfPTable hTable = new PdfPTable(2); // Grid layout for household info
                hTable.setWidthPercentage(100);
                hTable.setSpacingBefore(10);
                hTable.setWidths(new float[] { 1f, 1f });

                com.lowagie.text.pdf.PdfPCell hCell = new com.lowagie.text.pdf.PdfPCell();
                hCell.setColspan(2);
                hCell.setBackgroundColor(new java.awt.Color(230, 230, 230));
                hCell.setPadding(6);

                // Content construction
                StringBuilder sb = new StringBuilder();
                sb.append("House No: ").append(h.getHouseNumber());
                if (h.getLandmark() != null && !h.getLandmark().isEmpty())
                    sb.append("  |  Landmark: ").append(h.getLandmark());
                sb.append("\nAddress: ").append(h.getFullAddress());
                sb.append("\nRation Card: ").append(h.getRationCardNumber() != null ? h.getRationCardNumber() : "-");
                sb.append(" (").append(h.getRationCardType() != null ? h.getRationCardType() : "-").append(")");
                sb.append("  |  Status: ").append(h.getVisitStatus());
                if (h.getVisitedAt() != null)
                    sb.append(" (").append(h.getVisitedAt().toString().split(" ")[0]).append(")");

                hCell.addElement(new Paragraph(sb.toString(), fontSection));
                hCell.setBorder(com.lowagie.text.Rectangle.BOX);
                hTable.addCell(hCell);

                document.add(hTable);

                List<FamilyMember> members = familyMemberRepository.findByHouseholdId(h.getId());
                if (!members.isEmpty()) {
                    PdfPTable table = new PdfPTable(9);
                    table.setWidthPercentage(100);
                    table.setSpacingBefore(0);
                    table.setSpacingAfter(10);
                    table.setWidths(new float[] { 2.5f, 1f, 1.5f, 1.5f, 2f, 2f, 2f, 2f, 1.5f });

                    addPdfHeader(table, "Name", fontLabel);
                    addPdfHeader(table, "Gender", fontLabel);
                    addPdfHeader(table, "DOB", fontLabel);
                    addPdfHeader(table, "Relation", fontLabel);
                    addPdfHeader(table, "Education", fontLabel);
                    addPdfHeader(table, "Job", fontLabel);
                    addPdfHeader(table, "Mobile", fontLabel);
                    addPdfHeader(table, "Aadhaar", fontLabel);
                    addPdfHeader(table, "Flags", fontLabel);

                    for (FamilyMember m : members) {
                        table.addCell(new com.lowagie.text.Phrase(m.getFullName(), fontNormal));
                        table.addCell(new com.lowagie.text.Phrase(
                                m.getGender() != null ? m.getGender().name().substring(0, 1) : "", fontNormal));
                        table.addCell(new com.lowagie.text.Phrase(
                                m.getDateOfBirth() != null ? m.getDateOfBirth().toString() : "", fontNormal));
                        table.addCell(new com.lowagie.text.Phrase(
                                m.getRelationshipToHead() != null ? m.getRelationshipToHead() : "", fontNormal));
                        table.addCell(new com.lowagie.text.Phrase(m.getEducation() != null ? m.getEducation() : "",
                                fontNormal));
                        table.addCell(new com.lowagie.text.Phrase(m.getOccupation() != null ? m.getOccupation() : "",
                                fontNormal));
                        table.addCell(new com.lowagie.text.Phrase(
                                m.getMobileNumber() != null ? m.getMobileNumber() : "", fontNormal));
                        table.addCell(new com.lowagie.text.Phrase(
                                m.getAadhaarNumber() != null ? m.getAadhaarNumber() : "", fontNormal));

                        String flags = "";
                        if (Boolean.TRUE.equals(m.getDisabilityFlag()))
                            flags += "PwD ";
                        if (Boolean.TRUE.equals(m.getSeniorCitizenFlag()))
                            flags += "Sr.";
                        table.addCell(new com.lowagie.text.Phrase(flags.trim(), fontNormal));
                    }
                    document.add(table);
                } else {
                    Paragraph p = new Paragraph("No members recorded", fontNormal);
                    p.setIndentationLeft(10);
                    p.setSpacingAfter(10);
                    document.add(p);
                }
            }

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export PDF", e);
        }
    }

    private void addPdfHeader(PdfPTable table, String headerTitle, Font font) {
        com.lowagie.text.pdf.PdfPCell header = new com.lowagie.text.pdf.PdfPCell();
        header.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
        header.setPadding(5);
        header.setPhrase(new com.lowagie.text.Phrase(headerTitle, font));
        table.addCell(header);
    }
}
