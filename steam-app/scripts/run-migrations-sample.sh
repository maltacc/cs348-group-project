#!/bin/bash
for file in ../migrations-sample/*.sql; do
  echo "Running migration: $file"
  mysql -uroot -p < "$file"
done