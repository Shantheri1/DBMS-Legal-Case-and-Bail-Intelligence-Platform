"""
JurisPredict - Database Inspection & Table Data Viewer
Run anytime to view all tables, rows, and records defined in the project database.
Usage: python database/view_db.py [optional_table_name]
"""

import sys
import re
import io

# Ensure UTF-8 output on Windows consoles
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

seed_path = r'database/03_seed_data.sql'

def parse_seed_tables():
    with open(seed_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split into statements
    statements = re.split(r'INSERT\s+INTO\s+', content, flags=re.IGNORECASE)[1:]
    tables_data = {}

    for stmt in statements:
        m = re.match(r'([a-zA-Z0-9_]+)\s*\((.*?)\)\s*VALUES\s*(.*)', stmt, flags=re.DOTALL)
        if not m:
            continue
        table_name = m.group(1)
        columns = [c.strip() for c in m.group(2).split(',')]
        
        body = m.group(3)
        body = re.split(r'ON\s+CONFLICT|;\s*--', body, flags=re.IGNORECASE)[0].strip()
        if body.endswith(';'):
            body = body[:-1].strip()

        # Extract rows
        rows = []
        raw_rows = re.split(r'\),\s*(?:\r?\n\s*)?\(', body)
        for r in raw_rows:
            cleaned = r.strip()
            if cleaned.startswith('('):
                cleaned = cleaned[1:]
            if cleaned.endswith(')'):
                cleaned = cleaned[:-1]
            if cleaned:
                rows.append(cleaned)
        
        tables_data[table_name] = {
            'columns': columns,
            'rows': rows,
            'count': len(rows)
        }
    return tables_data

def display_table(table_name, info):
    print(f"\n================================================================================")
    print(f"TABLE: {table_name.upper()} ({info['count']} records)")
    print(f"================================================================================")
    print("Columns:", " | ".join(info['columns']))
    print("-" * 80)
    for idx, r in enumerate(info['rows'], 1):
        # truncate long strings/embeddings for readability
        display_r = re.sub(r'ARRAY\[.*?\]', '[384-dimensional pgvector dense vector]', r, flags=re.DOTALL)
        display_r = display_r.replace('\n', ' ').replace('\r', ' ')
        if len(display_r) > 130:
            display_r = display_r[:127] + '...'
        print(f"[{idx}] {display_r}")

def main():
    try:
        tables = parse_seed_tables()
    except Exception as e:
        print("Error reading seed data:", e)
        return

    filter_table = sys.argv[1].lower() if len(sys.argv) > 1 else None

    if filter_table:
        matched = {k: v for k, v in tables.items() if filter_table in k.lower()}
        if not matched:
            print(f"No table matching '{filter_table}' found. Available tables:")
            print(", ".join(tables.keys()))
            return
        for t, info in matched.items():
            display_table(t, info)
    else:
        print("=" * 80)
        print("  JURISPREDICT - MULTI-PARADIGM DATABASE SUMMARY (PostgreSQL + pgvector)")
        print("=" * 80)
        total_rows = sum(info['count'] for info in tables.values())
        print(f"Total Relational Tables : {len(tables)}")
        print(f"Total Seeded Records    : {total_rows} rows")
        print("-" * 80)
        for t, info in tables.items():
            print(f"  * {t:<26} : {info['count']:>2} rows  ({', '.join(info['columns'][:3])}...)")
        print("-" * 80)
        print("To view rows for any specific table, run:")
        print("  python database/view_db.py <table_name>   (e.g. python database/view_db.py cases)")
        print("=" * 80)

if __name__ == '__main__':
    main()
