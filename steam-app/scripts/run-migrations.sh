#!/bin/bash
for file in ../migrations/*.sql; do
  echo "Running migration: $file"
  mysql -uroot -p < "$file"
done