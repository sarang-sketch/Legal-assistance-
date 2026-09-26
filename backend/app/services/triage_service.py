"""Pro-Bono Legal Aid Intake & Access Triage Service.

Evaluates eligibility based on Federal Poverty Guidelines (125%-200% FPL),
calculates matter urgency, routes to appropriate non-profit legal clinics,
and generates step-by-step pro-se action checklists for vulnerable litigants.
"""

from datetime import datetime, timezone
import uuid
from typing import Dict, List
from app.core.config import get_settings
from app.models.domain import LegalCategory
from app.schemas.legal_requests import ProBonoTriageRequest
from app.schemas.legal_responses import LegalAidPartner, ProBonoTriageResponse

settings = get_settings()

# 2024/2025 Department of Health and Human Services (HHS) Poverty Guidelines
FPL_BASE = 15060  # 1-person household
FPL_INCREMENT = 5380  # per additional member


class LegalTriageService:
    """Intelligent triage engine for legal aid foundations and pro-se litigants."""

    LEGAL_AID_DIRECTORY: Dict[str, List[LegalAidPartner]] = {
        "CA": [
            LegalAidPartner(
                organization_name="Legal Aid Foundation of Los Angeles (LAFLA)",
                specialty_area="Eviction Defense, Domestic Violence, Government Benefits",
                address="1550 W 8th St, Los Angeles, CA 90017",
                phone="(800) 399-4529",
                website="https://lafla.org",
                intake_hours="Mon-Fri 9:00 AM - 12:00 PM PST",
                acceptance_rate="Priority given to active 5-day summons notices",
            ),
            LegalAidPartner(
                organization_name="Bay Area Legal Aid",
                specialty_area="Housing, Economic Justice, Consumer Law",
                address="1735 Telegraph Ave, Oakland, CA 94612",
                phone="(800) 551-5554",
                website="https://baylegal.org",
                intake_hours="Tues/Thurs 9:30 AM - 3:00 PM PST",
                acceptance_rate="Accepting low-income tenants facing no-fault displacement",
            ),
        ],
        "NY": [
            LegalAidPartner(
                organization_name="The Legal Aid Society New York",
                specialty_area="Civil Housing Defense, Immigration Rights",
                address="199 Water St, New York, NY 10038",
                phone="(212) 577-3300",
                website="https://legalaidnyc.org",
                intake_hours="Mon-Fri 9:00 AM - 5:00 PM EST",
                acceptance_rate="Universal Access to Counsel for housing court respondents",
            ),
            LegalAidPartner(
                organization_name="New York Legal Assistance Group (NYLAG)",
                specialty_area="Consumer Protection, Disability Advocacy, Asylum",
                address="100 Pearl St, New York, NY 10004",
                phone="(212) 613-5000",
                website="https://nylag.org",
                intake_hours="Mon-Wed 9:00 AM - 1:00 PM EST",
                acceptance_rate="High intake capacity for immigrant families",
            ),
        ],
        "DEFAULT": [
            LegalAidPartner(
                organization_name="National Legal Services Corporation (LSC) Partner",
                specialty_area="Comprehensive Civil Legal Aid for Low-Income Families",
                address="Regional Justice Center",
                phone="(800) 522-8355",
                website="https://www.lsc.gov/what-legal-aid/find-legal-aid",
                intake_hours="Mon-Fri 9:00 AM - 4:00 PM",
                acceptance_rate="Under 200% Federal Poverty Guideline",
            )
        ],
    }

    def calculate_fpl_percentage(self, household_size: int, annual_income: float) -> float:
        """Calculate household income as percentage of Federal Poverty Guideline."""
        base_fpl = FPL_BASE + (max(1, household_size) - 1) * FPL_INCREMENT
        if base_fpl <= 0:
            return 100.0
        return round((annual_income / base_fpl) * 100.0, 1)

    def determine_urgency(self, request: ProBonoTriageRequest) -> str:
        """Evaluate deadline urgency based on summons and hearing date."""
        if request.has_court_summons and request.hearing_date:
            return "CRITICAL_EMERGENCY"
        if request.has_court_summons:
            return "HIGH"
        return "STANDARD"

    async def evaluate_pro_bono_case(self, request: ProBonoTriageRequest) -> ProBonoTriageResponse:
        """Execute full triage assessment for pro-bono access."""
        case_id = f"CASE-{uuid.uuid4().hex[:8].upper()}"
        fpl_pct = self.calculate_fpl_percentage(request.household_size, request.annual_income)
        is_eligible = fpl_pct <= 200.0
        urgency = self.determine_urgency(request)

        # Region lookup
        state_key = request.state_or_zip[:2].upper()
        matched_clinics = self.LEGAL_AID_DIRECTORY.get(state_key, self.LEGAL_AID_DIRECTORY["DEFAULT"])

        # Determine category from text
        category = LegalCategory.HOUSING_AND_EVICTION
        text_lower = request.legal_issue_description.lower()
        if "asylum" in text_lower or "visa" in text_lower or "ice" in text_lower:
            category = LegalCategory.IMMIGRATION_ASYLUM
        elif "debt" in text_lower or "credit" in text_lower or "collector" in text_lower:
            category = LegalCategory.DEBT_AND_CONSUMER_RIGHTS
        elif "job" in text_lower or "wages" in text_lower or "fired" in text_lower:
            category = LegalCategory.EMPLOYMENT_AND_LABOR

        checklist = [
            "Do NOT ignore any court summons; missing your deadline results in automatic default judgment.",
            "Download and fill out Court Fee Waiver Request Form (FW-001) to waive all court filing fees.",
            "Gather all rental receipts, text messages with your landlord, and photos of apartment conditions.",
            "Submit your formal written Answer (Form UD-105) to the court clerk within 5 business days of service.",
            "Contact your matched Legal Aid organization immediately to request emergency attorney representation.",
        ]

        court_forms = [
            "Form FW-001 (Request to Waive Court Fees)",
            "Form UD-105 (Answer - Unlawful Detainer)",
            "Form POS-030 (Proof of Service by First-Class Mail)",
            "Form MC-025 (Attachment to Declaration of Habitability)",
        ]

        deadline_notice = None
        if urgency in ["CRITICAL_EMERGENCY", "HIGH"]:
            deadline_notice = (
                "EMERGENCY WARNING: In unlawful detainer eviction actions, you typically have only 5 CALENDAR DAYS "
                "(excluding judicial holidays) to file an Answer with the court clerk. Default eviction lockouts occur rapidly."
            )

        return ProBonoTriageResponse(
            case_id=case_id,
            category=category,
            urgency_level=urgency,
            poverty_guideline_percentage=fpl_pct,
            is_income_eligible=is_eligible,
            plain_language_summary=(
                f"Your household of {request.household_size} qualifies at {fpl_pct}% of the Federal Poverty Level. "
                f"You are eligible for 100% free legal representation. Your case relates to {category.value.replace('_', ' ')}."
            ),
            self_help_checklist=checklist,
            matched_legal_clinics=matched_clinics,
            statutory_deadline_warning=deadline_notice,
            suggested_court_forms=court_forms,
        )
