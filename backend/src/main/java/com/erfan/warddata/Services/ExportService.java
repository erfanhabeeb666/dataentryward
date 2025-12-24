package com.erfan.warddata.Services;

import com.erfan.warddata.Models.FamilyMember;
import com.erfan.warddata.Models.Household;
import com.erfan.warddata.Repos.FamilyMemberRepository;
import com.erfan.warddata.Repos.HouseholdRepository;
import com.erfan.warddata.Repos.WardRepository;
import com.erfan.warddata.Models.Ward;
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
    private final WardRepository wardRepository;

    public ExportService(HouseholdRepository householdRepository, FamilyMemberRepository familyMemberRepository,
            WardRepository wardRepository) {
        this.householdRepository = householdRepository;
        this.familyMemberRepository = familyMemberRepository;
        this.wardRepository = wardRepository;
    }

    public byte[] exportWardDataToExcel(Long wardId) {
        List<Household> households = householdRepository.findAllByWardId(wardId);
        Ward ward = wardRepository.findById(wardId).orElse(null);
        String wardDisplay = (ward != null) ? ward.getName() : "ID " + wardId;

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Ward " + wardDisplay);

            // Styles
            CellStyle houseHeaderStyle = workbook.createCellStyle();
            houseHeaderStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            houseHeaderStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            org.apache.poi.ss.usermodel.Font boldFont = workbook.createFont();
            boldFont.setBold(true);
            houseHeaderStyle.setFont(boldFont);
            houseHeaderStyle.setBorderBottom(BorderStyle.THIN);

            CellStyle memberHeaderStyle = workbook.createCellStyle();
            memberHeaderStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
            memberHeaderStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            memberHeaderStyle.setFont(boldFont);
            memberHeaderStyle.setBorderBottom(BorderStyle.THIN);

            CellStyle borderStyle = workbook.createCellStyle();
            borderStyle.setBorderBottom(BorderStyle.THIN);
            borderStyle.setBorderLeft(BorderStyle.THIN);
            borderStyle.setBorderRight(BorderStyle.THIN);
            borderStyle.setBorderTop(BorderStyle.THIN);

            int rowIdx = 0;

            for (Household h : households) {
                // 1. Household Header
                Row hRow = sheet.createRow(rowIdx++);
                Cell hCell = hRow.createCell(0);
                hCell.setCellValue("HOUSEHOLD: " + h.getHouseNumber() + " | Ration Card: "
                        + (h.getRationCardNumber() != null ? h.getRationCardNumber() : "-") + " ("
                        + h.getRationCardType() + ")");
                hCell.setCellStyle(houseHeaderStyle);
                sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(rowIdx - 1, rowIdx - 1, 0, 8));

                // 2. Household Details Row
                Row detailRow = sheet.createRow(rowIdx++);
                detailRow.createCell(0).setCellValue("Address:");
                detailRow.createCell(1).setCellValue(h.getFullAddress());
                detailRow.createCell(4).setCellValue("Landmark:");
                detailRow.createCell(5).setCellValue(h.getLandmark() != null ? h.getLandmark() : "-");
                detailRow.createCell(7).setCellValue("Status:");
                detailRow.createCell(8).setCellValue(h.getVisitStatus().name());

                // 3. Member Table Header
                Row mHeaderRow = sheet.createRow(rowIdx++);
                String[] columns = { "Name", "Relation", "Gender", "DOB", "Education", "Occupation", "Mobile",
                        "Aadhaar", "Flags" };
                for (int i = 0; i < columns.length; i++) {
                    Cell cell = mHeaderRow.createCell(i);
                    cell.setCellValue(columns[i]);
                    cell.setCellStyle(memberHeaderStyle);
                }

                // 4. Member Data
                List<FamilyMember> members = familyMemberRepository.findByHouseholdId(h.getId());
                if (members.isEmpty()) {
                    Row emptyRow = sheet.createRow(rowIdx++);
                    emptyRow.createCell(0).setCellValue("No members recorded");
                    sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(rowIdx - 1, rowIdx - 1, 0, 8));
                } else {
                    for (FamilyMember m : members) {
                        Row row = sheet.createRow(rowIdx++);
                        row.createCell(0).setCellValue(m.getFullName());
                        row.createCell(1).setCellValue(m.getRelationshipToHead());
                        row.createCell(2).setCellValue(m.getGender() != null ? m.getGender().name() : "");
                        row.createCell(3).setCellValue(m.getDateOfBirth() != null ? m.getDateOfBirth().toString() : "");
                        row.createCell(4).setCellValue(m.getEducation());
                        row.createCell(5).setCellValue(m.getOccupation());
                        row.createCell(6).setCellValue(m.getMobileNumber());
                        row.createCell(7).setCellValue(m.getAadhaarNumber());

                        String flags = "";
                        if (Boolean.TRUE.equals(m.getDisabilityFlag()))
                            flags += "PwD ";
                        if (Boolean.TRUE.equals(m.getSeniorCitizenFlag()))
                            flags += "Sr.";
                        row.createCell(8).setCellValue(flags.trim());
                    }
                }

                rowIdx++; // Spacer row
            }

            // Post-processing: Auto-size
            for (int i = 0; i <= 8; i++) {
                sheet.autoSizeColumn(i);
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
        Ward ward = wardRepository.findById(wardId).orElse(null);
        String wardDisplay = (ward != null) ? ward.getName() : "ID " + wardId;

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(com.lowagie.text.PageSize.A4.rotate()); // Landscape
            PdfWriter.getInstance(document, out);
            document.open();

            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
            fontTitle.setSize(18);
            Paragraph title = new Paragraph("Ward Data Report - Ward " + wardDisplay, fontTitle);
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
