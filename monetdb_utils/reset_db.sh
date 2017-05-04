#!/bin/bash
#
# Resets the MonetDB "dinamite" database used for TimeSquared.
#
# If you provide a preprocessed tracefile as an argument to this script,
# this script will import the trace for you as well.
#
# Usage:
# ./reset_db.sh [PREPROCESSED_DBDATA.TXT]

DBNAME="dinamite"

monetdb stop $DBNAME
monetdb destroy $DBNAME
monetdb create $DBNAME
monetdb release $DBNAME
mclient $DBNAME < trace.sql
if [ $# -ge 1 ]; then
    mclient $DBNAME -s "COPY INTO trace FROM '`readlink -f $1`' USING DELIMITERS ' ';"
fi