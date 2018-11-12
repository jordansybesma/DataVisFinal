'''
Needs to:
- check if a row's county code and death code are identical to something in our existing aggregate table.
- if so, add the two row's death counts. Else add it to the table.

organize sheet by county code and death code

'''
import os
import csv

def main():
	sheet = {}
	fields = []

	root = os.getcwd()
	for folder, subs, files in os.walk(root):
		for filename in files:
			if ".csv" in filename:
				print("Opening {0}".format(filename))
				with open(filename) as data:
					reader = csv.DictReader(data)
					for row in reader:
						if row['County Code'] == "": # This row doesnt have data
							continue
						elif sheet.get(row['County Code'], None) == None: # We haven't seen this county yet
							sheet[row['County Code']] = {}
							sheet[row['County Code']]['County Code'] = row['County Code']
							sheet[row['County Code']][row['UCD - ICD-10 113 Cause List Code'][6:]] = row['Deaths']
						elif sheet[row['County Code']].get(row['UCD - ICD-10 113 Cause List Code'][6:], None) == None: # We haven't seen this cause of death in this county yet
							sheet[row['County Code']][row['UCD - ICD-10 113 Cause List Code'][6:]] = row['Deaths']
						else: # We've seen this cause of death in this county
							sheet[row['County Code']][row['UCD - ICD-10 113 Cause List Code'][6:]] = int(sheet[row['County Code']][row['UCD - ICD-10 113 Cause List Code'][6:]]) + int(row['Deaths']) 

						if not row['UCD - ICD-10 113 Cause List Code'][6:] in fields:
							fields.append(row['UCD - ICD-10 113 Cause List Code'][6:])
	
	fields.sort()
	fields.insert(0, 'County Code')
	with open('output.csv', 'w+', newline=''	) as output:
		writer = csv.DictWriter(output, fieldnames=fields,)
		writer.writeheader()
		for value in sheet.values():
			writer.writerow(value)


if __name__ == '__main__':
	main()