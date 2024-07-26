#!/bin/bash

usage() {
  echo "Usage: $0 -d dbname (-o output.csv | -i input.csv [-n num])"
  exit 1
}

while getopts ":d:o:i:n:" opt; do
  case $opt in
    d)
      db_name="$OPTARG"
      ;;
    o)
      output_file="$OPTARG"
      action="export"
      ;;
    i)
      input_file="$OPTARG"
      action="import"
      ;;
    n)
      start_id="$OPTARG"
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      usage
      ;;
    :)
      echo "Option -$OPTARG requires an argument." >&2
      usage
      ;;
  esac
done

if [ -z "$db_name" ]; then
  echo "Error: -d dbname is required."
  usage
fi

if [ -z "$action" ]; then
  echo "Error: Please specify either -o for output.csv or -i for input.csv."
  usage
fi

if [ ! -f "$db_name" ]; then
  echo "Error: Database "$db_name" does not exist."
  exit 1
fi

if [ "$action" = "export" ]; then
  if [ -f "$output_file" ]; then
    echo "Error: Output file "$output_file" already exists."
    exit 1
  fi

  sql_file=$(mktemp /tmp/temp_sql.XXXXXX)

  cat << EOF > "$sql_file"
.mode csv
.output $output_file
select * from evaluation;
.quit
EOF

  sqlite3 $db_name < "$sql_file"

  rm "$sql_file"
fi

if [ "$action" = "import" ]; then
  if [ -z "$input_file" ]; then
    echo "Error: -i input.csv is required for import."
    usage
  fi
  if [ -z "$start_id" ]; then
    echo "Error: -n num is required for id replacement."
    usage
  fi

  temp_csv="tmp.csv"
  awk -v start_id="$start_id" 'BEGIN{FS=OFS=","} { $1=start_id++; print $0 }' "$input_file" > "$temp_csv"

  sqlite3 $db_name <<EOF
.mode csv
.import $temp_csv evaluation
.quit
EOF

  rm "$temp_csv"
fi

