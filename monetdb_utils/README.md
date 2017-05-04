# Setting up MonetDB

## MonetDB Installation and Setup

Instructions are summarized from the official MonetDB page: https://www.monetdb.org/Documentation/monetdbd

1. Install `monetdb`.  
**Debian/Ubuntu**:
```
sudo apt-get install monetdb
```

2. Create the monetdbd server configuration. You can specify any filepath you want. In the example below, `monetdbd` will create a subdirectory `monetdb` in our current working directory.
```
monetdbd create monetdb
```

3. Start the server.
```
monetdbd start monetdb
```

4. Use the `monetdb` client to create a new database.
```
monetdb create dinamite
monetdb start dinamite
monetdb status
```

5. Unlock the new database to take it out of maintenance mode.
```
monetdb release dinamite
monetdb status
```

6. Verify the .monetdb configuration file. This file simply stores the default username and password used to access the monetdb database. Having it present in your current working directory conveniently allows you to access the db without entering credentials for every command.

7. Access the database using `mclient`.
```
mclient dinamite
```

## DINAMITE-specific Setup

1. Initialize tables.
```
mclient dinamite < trace.sql
```

2. Preprocess your tracefile.
```
mkdir tracefiles
cp $datafile tracefiles/
./preprocess_dbdata.py tracefiles
```

3. Load your tracefile into the database.
```
mclient dinamite -s "COPY INTO trace FROM '`readlink -f tracefiles/preprocessed_data.txt`' USING DELIMITERS ' ';"
```
