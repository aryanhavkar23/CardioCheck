---
name: Clinical Decision Intelligence
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#43474c'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#74777d'
  outline-variant: '#c3c7cd'
  surface-tint: '#4c6075'
  primary: '#000f1d'
  on-primary: '#ffffff'
  primary-container: '#0f2537'
  on-primary-container: '#788da3'
  inverse-primary: '#b3c9e0'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#000a30'
  on-tertiary: '#ffffff'
  tertiary-container: '#001d60'
  on-tertiary-container: '#6e87db'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cfe5fd'
  primary-fixed-dim: '#b3c9e0'
  on-primary-fixed: '#061d2f'
  on-primary-fixed-variant: '#34495c'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#dce1ff'
  tertiary-fixed-dim: '#b6c4ff'
  on-tertiary-fixed: '#00164e'
  on-tertiary-fixed-variant: '#264191'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.5rem
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
  body-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1rem
  label-data-lg:
    fontFamily: JetBrains Mono
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
  label-data-md:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
    letterSpacing: 0em
  label-data-sm:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.02em
  label-ui:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system delivers a clinical-grade diagnostic intelligence interface tailored for cardiologists, triage practitioners, and internal medicine physicians. The core brand ethos balances absolute clinical rigor with modern software speed. The interface avoids dramatic consumer-health gradients and high-intensity alarms, adopting instead a disciplined, objective, and calm diagnostic workspace.

The design movement is **Corporate / Modern Clinical Precision**:
- High visual legibility under sterile lighting and high-throughput ward environments.
- Analytical, measured communication: probabilistic outputs and model metrics are presented transparently without hyperbole or diagnostic overreach.
- Dense information structuring supported by generous macro-margins, maintaining cognitive clarity during rapid chart reviews.
- Strict visual hierarchy separating patient biometric inputs, classification inference scores, and longitudinal risk metrics.

## Colors

The palette establishes an immediate atmosphere of authority, precision, and clinical hygiene. 

- **Primary (`#0F2537`)**: Deep Navy anchors the primary navigation rails, top-level headings, key interaction states, and structural chrome.
- **Secondary / Medical Teal (`#0D9488`)**: Utilized for positive confirmation actions, primary stepper progress indicators, active interactive states, and confidence bands.
- **Tertiary (`#1E3A8A`)**: Deep Royal Blue employed for focused contextual items, interactive clinical tools, and secondary visual tags.
- **Neutral Canvas & Surfaces**:
  - App Canvas / Base: `#F8FAFC` (Slate 50) transitioning to `#F1F5F9` (Slate 100) for structural framing and inactive metric wells.
  - Surface Containers: Pure `#FFFFFF` for primary cards, data tables, and modal dialogs.
  - Structural Division / Borders: `#E2E8F0` (Slate 200) applied at 1px thickness to anchor crisp boundaries.
- **Typography Tokens**:
  - Primary Clinical Copy: `#0F172A` (Slate 900) for maximum contrast compliance against `#FFFFFF`.
  - Secondary Metadata & Units: `#475569` (Slate 600) and `#64748B` (Slate 500).
- **Restrained Clinical Semantic Tokens**:
  - Low Risk / In Range: `#059669` (Subdued Emerald) paired with `#ECFDF5` background tints.
  - Moderate / Borderline Evaluation: `#D97706` (Soft Amber) paired with `#FFFBEB` background tints.
  - Elevated / Critical Risk Classification: `#E11D48` (Muted Crimson) paired with `#FFF1F2` background tints.

Semantic states must never flash violently or saturate entire containers; status markers are conveyed through bounded badge pills, left-accent borders (3px max), and micro-indicator dots.

## Typography

The typography strategy leverages **Inter** for all prose, navigational structures, and labels, taking advantage of its tall x-height, clear aperture definitions, and legible letterforms. 

For all clinical biomarkers, laboratory numerical values (e.g., resting BP, serum cholesterol, ST depression levels, thallium scan results), **JetBrains Mono** is enforced. This ensures vertical optical alignment across data tables and comparative telemetry charts. All numerical figures use tabular figures (`font-variant-numeric: tabular-nums`) to prevent horizontal jitter during live telemetry ingestion or value adjustments.

## Layout & Spacing

The layout is built on a structured **12-column fluid grid system** with rigid bounding outer parameters for desktop workstation monitors:
- **Desktop (1200px+)**: 12-column layout with 24px (`1.5rem`) gutters and a permanent 280px left rail navigation. Clinical data tables and dual-input diagnostic steppers utilize 8-column workspaces paired with 4-column real-time inference sidebars.
- **Tablet / Large Mobile (768px - 1199px)**: 8-column layout with 16px (`1rem`) gutters. The diagnostic summary drops beneath input cards as a docked or sticky bottom-sheet review panel.
- **Mobile (< 768px)**: 4-column single-stack layout with 16px margins. Forms convert into strict one-variable-per-row entry points.

Component padding enforces an 8pt architectural rhythm:
- Metric cards: `space-md` (16px) or `space-lg` (24px) internal padding.
- Compact table rows: 8px vertical padding (`space-sm`) and 16px horizontal padding (`space-md`) for high data density without overlapping interactive targets.

## Elevation & Depth

Visual hierarchy relies on **crisp structural boundaries combined with flat, tonal layering**, deliberately minimizing traditional dropped shadows to eliminate visual noise in clinical workflows:

- **Level 0 (Canvas Base)**: `#F8FAFC`. Completely unshadowed.
- **Level 1 (Clinical Cards & Tables)**: Background `#FFFFFF`, bordered by 1px solid `#E2E8F0`. Shadow is an imperceptible micro-ambient boundary: `0 1px 3px 0 rgba(15, 23, 42, 0.04)`.
- **Level 2 (Active/Hovered Card, Dropdowns, Stepper Focus)**: Background `#FFFFFF`, bordered by 1px solid `#CBD5E1`. Shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **Level 3 (Diagnostic Overlays & Action Modals)**: Background `#FFFFFF`, bordered by 1px solid `#94A3B8`. Shadow: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)`. Backdropped by `#0F172A` with 40% opacity.

Elevation is reinforced through contrast changes rather than blur radius: critical cards feature a distinct 3px left border accent corresponding to the classification state (e.g., `#0D9488` for normal, `#E11D48` for high probability of CAD).

## Shapes

The interface implements a restrained geometry (`roundedness: 2`):
- Standard panels, cards, and modal dialogs feature a **0.5rem (8px)** corner radius to maintain a modern yet orderly and clinical feel.
- Form inputs, segmented controls, and secondary buttons strictly maintain an **8px corner radius** (`0.5rem`).
- Badges, status chips, and stepper indicator nodes utilize a **fully rounded pill design** (`9999px`) to immediately distinguish diagnostic categorical tags and numeric counts from structural interactive containers.

## Components

### Buttons
- **Primary Action (Run Inference / Save Record)**: Background `#0F2537`, text `#FFFFFF`, border none, 8px radius, height 40px, padding 0 16px. Hover: `#1E3A8A`. Focus: 2px offset ring in `#0D9488`.
- **Secondary Action (Export PDF / Reset Parameters)**: Background `#FFFFFF`, border 1px solid `#CBD5E1`, text `#0F172A`. Hover: `#F1F5F9`.
- **Destructive Action**: Background `#FFF1F2`, border 1px solid `#FECDD3`, text `#E11D48`. Hover: `#FFE4E6`.

### Guided Stepper Forms
- Clinical parameter input divided into logical stages (e.g., Demographics -> Symptom Presentation -> Laboratory Biomarkers -> Imaging/ECG).
- Completed steps display a `#0D9488` pill with a micro checkmark. Active steps present a bold `#0F2537` label with an indicator dot. Unfinished steps are rendered in `#94A3B8`.

### Input Fields & Segmented Toggles
- Inputs feature a crisp 1px `#CBD5E1` border on `#FFFFFF` surfaces with unit labels anchored on the right edge in JetBrains Mono (`mmHg`, `mg/dl`, `bpm`). Active focus transitions border to `#0D9488` with an ambient glow of `rgba(13, 148, 136, 0.15)`.
- Segmented switches (e.g., Angina: Typical / Atypical / Non-anginal / Asymptomatic) utilize an enclosed `#F1F5F9` track with an elevated `#FFFFFF` toggle card for the selected state.

### Data Tables
- Clean tabular view for cohort records and historical scans.
- Header row: `#F8FAFC`, uppercase tracking, font size 12px, font weight 600, text `#475569`, border-bottom 2px solid `#E2E8F0`.
- Cells: Vertical alignment center, padding 10px 16px, border-bottom 1px solid `#F1F5F9`. Numerical columns must align right and render in JetBrains Mono.

### Status Chips & Confidence Badges
- Pill-shaped (`rounded-full`), padding 2px 10px, text size 12px, font weight 600.
- Emerald Chip: Background `#ECFDF5`, text `#047857`, border 1px solid `#A7F3D0`.
- Amber Chip: Background `#FFFBEB`, text `#B45309`, border 1px solid `#FDE68A`.
- Rose Chip: Background `#FFF1F2`, text `#BE123C`, border 1px solid `#FECDD3`.

### Clinical AI Inference Card & Disclaimer
- Output container features a distinct visual tier: background `#F8FAFC`, bordered by 1px solid `#E2E8F0`, with a persistent top accent bar (3px) reflecting the classification state.
- **Mandatory Disclaimer Banner**: Sits directly adjacent to the prediction score. Rendered on `#F1F5F9` with a subtle 1px dashed `#CBD5E1` border and a `#475569` italicized label: *"Statistical estimation based on trained cohort data. For decision-support purposes only; does not replace primary physician clinical evaluation."*