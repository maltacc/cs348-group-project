#!/bin/bash
for file in ../migrations-prod/*.sql; do
  echo "Running migration: $file"
  mysql -uroot -p < "$file"
done

