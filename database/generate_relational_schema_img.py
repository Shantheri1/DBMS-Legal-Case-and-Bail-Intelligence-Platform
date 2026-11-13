import os
import sys
import tempfile
import shutil

os.environ['MPLCONFIGDIR'] = tempfile.gettempdir()
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyArrowPatch

def draw_relational_schema():
    # Setup Figure (Wide canvas for clean layout)
    fig, ax = plt.subplots(figsize=(26, 20), dpi=200)
    ax.set_xlim(0, 260)
    ax.set_ylim(0, 200)
    ax.axis('off')

    # Top Academic Header matching reference Image 1
    ax.text(10, 194, "PES University  •  Department of CSE", fontsize=15, weight='bold', color='#1e293b')
    ax.text(130, 194, "JurisPredict Database Relational Schema (BCNF)", fontsize=18, weight='black', ha='center', color='#0f172a')
    ax.text(250, 194, "Shantheni Shenoy & Shriranjini", fontsize=14, weight='bold', ha='right', color='#1e293b')
    ax.text(130, 189, "Level 3 DBMS Experiential Learning Project  •  Instructor: Dr. Nagasundari S", fontsize=12, ha='center', color='#475569')

    # Legend / Key
    ax.text(10, 184, "LEGEND:", fontsize=10, weight='bold', color='#0f172a')
    ax.text(32, 184, "Underlined = Primary Key (PK)", fontsize=9.5, weight='bold', color='#0f172a')
    ax.text(85, 184, "Dotted Underline = Foreign Key (FK)", fontsize=9.5, style='italic', color='#1d4ed8')
    ax.text(145, 184, "── Red Arrow = Functional Dependency (PK → Attributes)", fontsize=9.5, color='#dc2626')
    ax.text(205, 184, "── Blue/Black Arrow = Referential Integrity (FK → PK)", fontsize=9.5, color='#2563eb')

    # Definition of tables and their positions
    # Format: table_name: (x, y, [(attr_name, is_pk, is_fk)])
    tables = {
        'ROLES': (10, 168, [
            ('role_id', True, False),
            ('role_name', False, False),
            ('description', False, False),
            ('created_at', False, False)
        ]),
        'USERS': (10, 142, [
            ('user_id', True, False),
            ('role_id', False, True),
            ('name', False, False),
            ('email', False, False),
            ('password_hash', False, False),
            ('phone', False, False),
            ('status', False, False)
        ]),
        'COURTS': (10, 116, [
            ('court_id', True, False),
            ('court_name', False, False),
            ('court_type', False, False),
            ('location', False, False),
            ('address', False, False)
        ]),
        'JUDGES': (10, 90, [
            ('judge_id', True, False),
            ('court_id', False, True),
            ('name', False, False),
            ('designation', False, False),
            ('email', False, False),
            ('status', False, False)
        ]),
        'PERSONS': (10, 64, [
            ('person_id', True, False),
            ('name', False, False),
            ('gender', False, False),
            ('date_of_birth', False, False),
            ('address', False, False),
            ('phone', False, False)
        ]),
        'CASE_PARTIES': (10, 38, [
            ('case_id', True, True),
            ('person_id', True, True),
            ('party_role', False, False),
            ('is_active', False, False)
        ]),
        'DOCUMENTS': (10, 12, [
            ('document_id', True, False),
            ('case_id', False, True),
            ('uploaded_by', False, True),
            ('document_type', False, False),
            ('file_url', False, False),
            ('extracted_text', False, False)
        ]),

        # COLUMN 2: Cases & Charges
        'CASES': (140, 168, [
            ('case_id', True, False),
            ('court_id', False, True),
            ('filed_by', False, True),
            ('case_number', False, False),
            ('title', False, False),
            ('filing_date', False, False),
            ('status', False, False),
            ('priority_level', False, False)
        ]),
        'OFFENCES': (140, 142, [
            ('offence_id', True, False),
            ('offence_name', False, False),
            ('description', False, False),
            ('bailable', False, False),
            ('severity_level', False, False)
        ]),
        'CHARGES': (140, 116, [
            ('charge_id', True, False),
            ('case_id', False, True),
            ('offence_id', False, True),
            ('description', False, False)
        ]),
        'LAW_SECTIONS': (140, 90, [
            ('section_id', True, False),
            ('act_name', False, False),
            ('section_number', False, False),
            ('description', False, False),
            ('punishment_summary', False, False)
        ]),
        'CHARGE_LAW_SECTIONS': (140, 64, [
            ('charge_id', True, True),
            ('section_id', True, True)
        ]),
        'HEARINGS': (140, 38, [
            ('hearing_id', True, False),
            ('case_id', False, True),
            ('judge_id', False, True),
            ('hearing_date', False, False),
            ('stage', False, False),
            ('outcome', False, False),
            ('next_hearing_date', False, False)
        ]),

        # BOTTOM & SPECIAL: Bail & Precedents
        'BAIL_APPLICATIONS': (140, 12, [
            ('bail_id', True, False),
            ('case_id', False, True),
            ('applied_by', False, True),
            ('application_date', False, False),
            ('bail_type', False, False),
            ('grounds', False, False),
            ('risk_score', False, False),
            ('status', False, False)
        ]),
        'BAIL_DECISIONS': (10, -14, []), # will place in custom sub-block
        'JUDICIAL_PRECEDENTS': (140, -14, [])
    }

    # Better 3-Column Balanced Coordinates
    # Col 1: x = 12 (Width ~75)
    # Col 2: x = 95 (Width ~80)
    # Col 3: x = 180 (Width ~75)
    
    col_layout = {
        # Column 1: Organization & Users & Parties
        'ROLES': (10, 160, [
            ('role_id', True, False),
            ('role_name', False, False),
            ('description', False, False)
        ]),
        'USERS': (10, 134, [
            ('user_id', True, False),
            ('role_id', False, True),
            ('name', False, False),
            ('email', False, False),
            ('status', False, False)
        ]),
        'COURTS': (10, 108, [
            ('court_id', True, False),
            ('court_name', False, False),
            ('court_type', False, False),
            ('location', False, False)
        ]),
        'JUDGES': (10, 82, [
            ('judge_id', True, False),
            ('court_id', False, True),
            ('name', False, False),
            ('designation', False, False)
        ]),
        'PERSONS': (10, 56, [
            ('person_id', True, False),
            ('name', False, False),
            ('gender', False, False),
            ('date_of_birth', False, False)
        ]),
        'CASE_PARTIES': (10, 30, [
            ('case_id', True, True),
            ('person_id', True, True),
            ('party_role', False, False),
            ('is_active', False, False)
        ]),

        # Column 2: Cases, Charges, Law Sections
        'CASES': (95, 160, [
            ('case_id', True, False),
            ('court_id', False, True),
            ('filed_by', False, True),
            ('case_number', False, False),
            ('title', False, False),
            ('status', False, False)
        ]),
        'OFFENCES': (95, 134, [
            ('offence_id', True, False),
            ('offence_name', False, False),
            ('bailable', False, False),
            ('severity_level', False, False)
        ]),
        'CHARGES': (95, 108, [
            ('charge_id', True, False),
            ('case_id', False, True),
            ('offence_id', False, True),
            ('description', False, False)
        ]),
        'LAW_SECTIONS': (95, 82, [
            ('section_id', True, False),
            ('act_name', False, False),
            ('section_number', False, False),
            ('punishment', False, False)
        ]),
        'CHARGE_LAW_SECTIONS': (95, 56, [
            ('charge_id', True, True),
            ('section_id', True, True)
        ]),
        'DOCUMENTS': (95, 30, [
            ('document_id', True, False),
            ('case_id', False, True),
            ('uploaded_by', False, True),
            ('doc_type', False, False)
        ]),

        # Column 3: Hearings, Bail & Precedents
        'HEARINGS': (180, 160, [
            ('hearing_id', True, False),
            ('case_id', False, True),
            ('judge_id', False, True),
            ('hearing_date', False, False),
            ('stage', False, False)
        ]),
        'BAIL_APPLICATIONS': (180, 126, [
            ('bail_id', True, False),
            ('case_id', False, True),
            ('applied_by', False, True),
            ('bail_type', False, False),
            ('grounds', False, False),
            ('risk_score', False, False)
        ]),
        'BAIL_DECISIONS': (180, 92, [
            ('decision_id', True, False),
            ('bail_id', False, True),
            ('judge_id', False, True),
            ('hearing_id', False, True),
            ('decision', False, False),
            ('surety_amount', False, False)
        ]),
        'JUDICIAL_PRECEDENTS': (180, 48, [
            ('precedent_id', True, False),
            ('citation', False, False),
            ('court_level', False, False),
            ('decision_outcome', False, False),
            ('embedding_384d', False, False)
        ])
    }

    # Store cell coordinates for drawing arrows
    # Key: (table_name, col_name) -> (center_x, top_y, bottom_y, left_x, right_x)
    cell_coords = {}

    cell_height = 5.0
    pk_color = '#eff6ff'
    fk_color = '#fefce8'
    reg_color = '#ffffff'
    border_color = '#1e293b'

    # Render each relation
    for tname, (x, y, cols) in col_layout.items():
        # Title of table
        ax.text(x, y + 6.8, tname, fontsize=11, weight='black', color='#0f172a')

        curr_x = x
        pk_centers = []
        non_pk_centers = []

        for cname, is_pk, is_fk in cols:
            # Determine cell width based on name length
            w = max(11.0, len(cname) * 1.35 + 2.5)
            
            # Background face color
            if is_pk and is_fk:
                fc = '#f0fdf4' # Soft emerald for composite PK+FK
            elif is_pk:
                fc = '#eff6ff' # Soft blue for PK
            elif is_fk:
                fc = '#fefce8' # Soft amber for FK
            else:
                fc = '#ffffff'

            rect = patches.Rectangle((curr_x, y), w, cell_height, linewidth=1.2, edgecolor=border_color, facecolor=fc, zorder=2)
            ax.add_patch(rect)

            # Text inside cell
            cx = curr_x + w / 2.0
            cy = y + cell_height / 2.0
            
            # Format text label
            if is_pk:
                ax.text(cx, cy, cname, fontsize=8.5, weight='bold', ha='center', va='center', zorder=3, color='#0f172a')
                # Underline for PK
                ax.plot([curr_x + 1.2, curr_x + w - 1.2], [y + 1.2, y + 1.2], color='#0f172a', linewidth=1.3, zorder=3)
                pk_centers.append(cx)
            elif is_fk:
                ax.text(cx, cy, cname, fontsize=8.5, style='italic', ha='center', va='center', zorder=3, color='#1e3a8a')
                # Dashed underline for FK
                ax.plot([curr_x + 1.2, curr_x + w - 1.2], [y + 1.2, y + 1.2], color='#2563eb', linestyle=':', linewidth=1.4, zorder=3)
                non_pk_centers.append(cx)
            else:
                ax.text(cx, cy, cname, fontsize=8.5, ha='center', va='center', zorder=3, color='#334155')
                non_pk_centers.append(cx)

            # Store coordinates
            cell_coords[(tname, cname)] = {
                'cx': cx,
                'cy': cy,
                'top': y + cell_height,
                'bottom': y,
                'left': curr_x,
                'right': curr_x + w
            }

            curr_x += w

        # Draw red Functional Dependency overhead arrows: PK -> Attributes (like Image 1)
        if pk_centers and non_pk_centers:
            first_pk_cx = pk_centers[0]
            top_y = y + cell_height
            fd_bar_y = top_y + 2.2
            
            # Vertical line up from PK
            ax.plot([first_pk_cx, first_pk_cx], [top_y, fd_bar_y], color='#dc2626', linewidth=0.9, zorder=4)

            # Horizontal distribution line
            max_attr_cx = max(non_pk_centers)
            ax.plot([first_pk_cx, max_attr_cx], [fd_bar_y, fd_bar_y], color='#dc2626', linewidth=0.9, zorder=4)

            # Vertical arrowheads down to each non-pk attribute
            for ncx in non_pk_centers:
                arrow = FancyArrowPatch(
                    (ncx, fd_bar_y), (ncx, top_y),
                    arrowstyle='->', mutation_scale=7, color='#dc2626', linewidth=0.9, zorder=4
                )
                ax.add_patch(arrow)

    # Function to draw Referential Integrity Arrow (FK -> PK) with nice curved or stepped routing
    def draw_fk_arrow(from_table, from_col, to_table, to_col, connection_type='curve', rad=0.2, color='#1d4ed8'):
        if (from_table, from_col) not in cell_coords or (to_table, to_col) not in cell_coords:
            return
        c_from = cell_coords[(from_table, from_col)]
        c_to = cell_coords[(to_table, to_col)]

        start = (c_from['cx'], c_from['bottom'])
        end = (c_to['cx'], c_to['top'])

        # Draw styled arrow
        arrow = FancyArrowPatch(
            start, end,
            connectionstyle=f"arc3,rad={rad}",
            arrowstyle='-|>',
            mutation_scale=10,
            color=color,
            linewidth=1.2,
            linestyle='-',
            zorder=5
        )
        ax.add_patch(arrow)

    # Connect Foreign Keys to their Primary Keys (Reference Image 1 black/blue arrows)
    # Column 1 Internal links:
    draw_fk_arrow('USERS', 'role_id', 'ROLES', 'role_id', rad=0.25)
    draw_fk_arrow('JUDGES', 'court_id', 'COURTS', 'court_id', rad=0.25)
    draw_fk_arrow('CASE_PARTIES', 'person_id', 'PERSONS', 'person_id', rad=0.25)

    # Column 2 Internal links:
    draw_fk_arrow('CHARGES', 'offence_id', 'OFFENCES', 'offence_id', rad=0.25)
    draw_fk_arrow('CHARGE_LAW_SECTIONS', 'section_id', 'LAW_SECTIONS', 'section_id', rad=0.25)
    draw_fk_arrow('CHARGE_LAW_SECTIONS', 'charge_id', 'CHARGES', 'charge_id', rad=-0.25)

    # Column 3 Internal links:
    draw_fk_arrow('BAIL_DECISIONS', 'bail_id', 'BAIL_APPLICATIONS', 'bail_id', rad=0.2)
    draw_fk_arrow('BAIL_DECISIONS', 'hearing_id', 'HEARINGS', 'hearing_id', rad=-0.25)

    # Cross-Column Links:
    # CASES -> COURTS, USERS
    draw_fk_arrow('CASES', 'court_id', 'COURTS', 'court_id', rad=0.15)
    draw_fk_arrow('CASES', 'filed_by', 'USERS', 'user_id', rad=0.1)

    # CHARGES -> CASES
    draw_fk_arrow('CHARGES', 'case_id', 'CASES', 'case_id', rad=-0.15)

    # CASE_PARTIES -> CASES
    draw_fk_arrow('CASE_PARTIES', 'case_id', 'CASES', 'case_id', rad=-0.1)

    # HEARINGS -> CASES, JUDGES
    draw_fk_arrow('HEARINGS', 'case_id', 'CASES', 'case_id', rad=0.15)
    draw_fk_arrow('HEARINGS', 'judge_id', 'JUDGES', 'judge_id', rad=0.25)

    # BAIL_APPLICATIONS -> CASES, USERS
    draw_fk_arrow('BAIL_APPLICATIONS', 'case_id', 'CASES', 'case_id', rad=-0.15)
    draw_fk_arrow('BAIL_APPLICATIONS', 'applied_by', 'USERS', 'user_id', rad=-0.25)

    # BAIL_DECISIONS -> JUDGES
    draw_fk_arrow('BAIL_DECISIONS', 'judge_id', 'JUDGES', 'judge_id', rad=-0.28)

    # DOCUMENTS -> CASES, USERS
    draw_fk_arrow('DOCUMENTS', 'case_id', 'CASES', 'case_id', rad=0.15)
    draw_fk_arrow('DOCUMENTS', 'uploaded_by', 'USERS', 'user_id', rad=-0.15)

    plt.tight_layout()
    
    out_dir = r"docs/diagrams"
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "relational_schema_academic.png")
    plt.savefig(out_file, bbox_inches='tight', dpi=200)
    plt.close()
    print(f"Generated: {out_file}")

    # Copy to artifacts directory
    artifact_dir = r"C:\Users\sheno\.gemini\antigravity\brain\a5782285-3f89-45dd-b1ab-8a23c91fce50\diagrams"
    os.makedirs(artifact_dir, exist_ok=True)
    shutil.copy(out_file, os.path.join(artifact_dir, "relational_schema_academic.png"))
    print(f"Copied to artifact dir: {artifact_dir}")

if __name__ == '__main__':
    draw_relational_schema()
