import io
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether
)
from .feature_mapper import format_features_for_display

def generate_assessment_pdf(patient, assessment, doctor) -> io.BytesIO:
    """
    Generates a clean clinical assessment PDF report using ReportLab.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    header_title_style = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F2537')
    )
    subtitle_style = ParagraphStyle(
        'HeaderSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#0D9488')
    )
    meta_style = ParagraphStyle(
        'MetaText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#64748B')
    )
    section_title = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0F2537'),
        spaceAfter=6
    )
    body_text = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0F172A')
    )
    disclaimer_style = ParagraphStyle(
        'DisclaimerText',
        parent=styles['Italic'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#475569')
    )

    story = []

    # 1. Header Section: Brand & Meta
    header_table_data = [
        [
            Paragraph("<b>CardioCheck</b>", header_title_style),
            Paragraph(f"<b>Assessment Reference:</b> {assessment.reference_id}<br/>"
                      f"<b>Date:</b> {assessment.created_at.strftime('%B %d, %Y at %H:%M UTC')}", meta_style)
        ],
        [
            Paragraph("CLINICAL DECISION SUPPORT REPORT", subtitle_style),
            Paragraph(f"<b>Attending:</b> {doctor.full_name if doctor else 'Cardiology Service'}", meta_style)
        ]
    ]
    header_table = Table(header_table_data, colWidths=[300, 240])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#CBD5E1'), spaceAfter=12))

    # 2. Patient Demographics Box
    patient_sex = "Female" if patient.sex == 0 else "Male"
    patient_info_data = [
        [
            Paragraph(f"<b>Patient Name:</b> {patient.name}", body_text),
            Paragraph(f"<b>Medical Record #:</b> {patient.mrn}", body_text),
            Paragraph(f"<b>Age / Sex:</b> {patient.age} yrs / {patient_sex}", body_text)
        ],
        [
            Paragraph(f"<b>DOB:</b> {patient.dob or 'N/A'}", body_text),
            Paragraph(f"<b>Blood Group:</b> {patient.blood_group or 'A+'}", body_text),
            Paragraph(f"<b>Primary Ward:</b> {patient.ward or 'Cardiology Clinic'}", body_text)
        ],
        [
            Paragraph(f"<b>Protocol:</b> {patient.protocol or 'CAD Risk Evaluation'}", body_text),
            Paragraph(f"<b>Allergies:</b> {patient.allergies or 'None Reported'}", body_text),
            Paragraph(f"<b>Consent:</b> {patient.consent_status or 'Active'}", body_text)
        ]
    ]
    patient_table = Table(patient_info_data, colWidths=[180, 180, 180])
    patient_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#F1F5F9')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(patient_table)
    story.append(Spacer(1, 14))

    # 3. Model Classification Output Banner
    is_class_1 = (assessment.prediction == 1)
    banner_bg = colors.HexColor('#FFF1F2') if is_class_1 else colors.HexColor('#ECFDF5')
    banner_border = colors.HexColor('#E11D48') if is_class_1 else colors.HexColor('#059669')
    banner_text_color = colors.HexColor('#9F1239') if is_class_1 else colors.HexColor('#065F46')

    class_title = "Class 1: Heart Disease Category Present" if is_class_1 else "Class 0: No Heart Disease Category"
    class_desc = assessment.explanation or (
        "The submitted clinical features were classified into the heart-disease-present category."
        if is_class_1 else
        "The submitted clinical features were classified into the no-heart-disease category."
    )

    banner_data = [
        [
            Paragraph(f"<font color='{banner_text_color.hexval()}'><b>MODEL CLASSIFICATION: {class_title.upper()}</b></font>", ParagraphStyle('B1', fontName='Helvetica-Bold', fontSize=12, leading=15)),
        ],
        [
            Paragraph(f"{class_desc}", body_text)
        ],
        [
            Paragraph("<i>Note: This statistical model result is not a confirmed medical diagnosis.</i>", meta_style)
        ]
    ]
    banner_table = Table(banner_data, colWidths=[540])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), banner_bg),
        ('BOX', (0, 0), (-1, -1), 1.5, banner_border),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 14))

    # 4. Table of Submitted 13 Clinical Criteria
    story.append(Paragraph("<b>Submitted Clinical Information (13 Biomarkers)</b>", section_title))
    raw_dict = assessment.get_features_dict()
    formatted = format_features_for_display(raw_dict)

    table_rows = [
        [Paragraph("<b>Clinical Biomarker</b>", body_text), Paragraph("<b>Recorded Value / Interpretation</b>", body_text),
         Paragraph("<b>Clinical Biomarker</b>", body_text), Paragraph("<b>Recorded Value / Interpretation</b>", body_text)]
    ]
    items = list(formatted.items())
    for i in range(0, len(items), 2):
        k1, v1 = items[i]
        if i + 1 < len(items):
            k2, v2 = items[i+1]
        else:
            k2, v2 = "", ""
        table_rows.append([
            Paragraph(k1, meta_style), Paragraph(f"<b>{v1}</b>", body_text),
            Paragraph(k2, meta_style), Paragraph(f"<b>{v2}</b>", body_text)
        ])

    feat_table = Table(table_rows, colWidths=[135, 135, 135, 135])
    feat_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
        ('LINEBELOW', (0, 0), (-1, 0), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(feat_table)
    story.append(Spacer(1, 14))

    # 5. Doctor's Clinical Notes & Next Steps
    story.append(Paragraph("<b>Physician Notes & Clinical Action Plan</b>", section_title))
    notes_content = assessment.doctor_notes or "No clinical notes entered for this assessment."
    protocol_content = assessment.recommended_protocol or "Follow standard outpatient protocol."
    followup_content = assessment.follow_up_text or "As clinically indicated."

    notes_data = [
        [Paragraph("<b>Clinical Observations:</b>", body_text), Paragraph(notes_content, body_text)],
        [Paragraph("<b>Planned Protocol:</b>", body_text), Paragraph(protocol_content, body_text)],
        [Paragraph("<b>Follow-up Interval:</b>", body_text), Paragraph(followup_content, body_text)],
    ]
    notes_table = Table(notes_data, colWidths=[130, 410])
    notes_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FFFFFF')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#F1F5F9')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(notes_table)
    story.append(Spacer(1, 14))

    # 6. Disclaimer Banner & Physician Sign-off
    disclaimer_data = [
        [
            Paragraph(
                "<b>Mandatory Clinical Decision Support Notice:</b><br/>"
                "CardioCheck's Logistic Regression inference is trained on the Cleveland Heart Disease Dataset. "
                "This statistical classification does not represent a confirmed medical diagnosis and must be interpreted in conjunction "
                "with clinical examination, angiographic/echocardiographic studies, and direct physician judgment.",
                disclaimer_style
            )
        ]
    ]
    disclaimer_table = Table(disclaimer_data, colWidths=[540])
    disclaimer_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(disclaimer_table)
    story.append(Spacer(1, 16))

    # Sign-off Line
    doc_name = doctor.full_name if doctor else "Attending Cardiologist, MD"
    sign_table = Table([
        [
            Paragraph(f"<b>Electronically Authenticated by:</b> {doc_name}<br/>Department of Cardiology", meta_style),
            Paragraph("<b>Signature:</b> <i>Validated via CardioCheck EHR</i>", meta_style)
        ]
    ], colWidths=[320, 220])
    sign_table.setStyle(TableStyle([
        ('ALIGN', (1, 0), (1, 0), 'RIGHT')
    ]))
    story.append(sign_table)

    doc.build(story)
    buffer.seek(0)
    return buffer
