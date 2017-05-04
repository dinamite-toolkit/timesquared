#!/usr/bin/env python2
import glob, os, re, sys
from operator import itemgetter

if (len(sys.argv) > 2):
	print "Only one argument required"

elif (len(sys.argv) == 2):
	directory = str(sys.argv[1])
	if os.path.exists(directory):
		fds = []

		os.chdir(directory)

		if os.path.isfile('preprocessed_data.txt'):
			os.remove("preprocessed_data.txt")

		for file in glob.glob("*.txt"):
		    fd = open(file, 'r')
		    fds.append(fd)

		def readLine(fd):
			line = fd.readline()
			isValidLine = re.match(r'(-->|<--)\s+\w+\s+\d+\s+\d+($|\s+\w+)', line)

			if not isValidLine and line != "":
				print "line " + line + " is not in the correct format"
				return None

			else:
				return line

		def createLineDict(line, fd):
			line = line.strip()
			line = line.split()
			
			direction = line[0]
			if (direction == "-->"):
				direction = "0"
			else:
				direction = "1"

			function = line[1]
			tid = line[2]
			time = line[3]
					
			lockname = "_".join(line[4:len(line)])
			if (lockname == ""):
				lockname = "null"

			lineDict = {'direction':direction, 'function':function, 'tid':tid, 'time':time, 'lockname':lockname, 'fd':fd}
			return lineDict


		with open("preprocessed_data.txt", 'w') as fout:
			lineDicts = []
			i = 0
			while i < len(fds):
				fd = fds[i]
				line = None
				while (line == None):
					line = readLine(fd)

				if (line == ""):
					fd.close()
					fds.remove(fd)

				else:
					lineDict = createLineDict(line, fd)
					lineDicts.append(lineDict)
			
				i+=1

			oid = 0
			eventid = 0
			eventids = {}

			while len(lineDicts) > 0:
				lineDicts = sorted(lineDicts, key=itemgetter('time'))
				lineDict = lineDicts[0]
				direction = lineDict['direction']
				function = lineDict['function']
				tid = lineDict['tid']
				time = lineDict['time']
				lockname = lineDict['lockname']
				fd = lineDict['fd']
				
				if (direction == "0"):
					eventids[tid + function + lockname] = eventid
					fout.write(str(oid) + " " + str(eventid) + " " + direction + " " + function + " " + tid + " " + time + " " + lockname + "\n")
					eventid+=1
				elif (tid + function + lockname in eventids):
					fout.write(str(oid) + " " + str(eventids[tid + function + lockname]) + " " + direction + " " + function + " " + tid + " " + time + " " + lockname + "\n")
					del eventids[tid + function + lockname]
				else:
					print "Ignoring " + line
							
				oid+=1
				
				lineDicts.remove(lineDict)

				line = None
				while (line == None):
					line = readLine(fd)

				if (line != ""):
					lineDict = createLineDict(line, fd)
					lineDicts.append(lineDict)
				else:
					fd.close()
	else:
		print "Directory %s not found!" % (directory)

else:
	print "Not enough arguments!"
