'''
CountyName | FIPS | Year | PersonalIncome | DiabetesPercent

2004-2013

'''

import csv

if __name__ == '__main__':
	sheet = {}

	print('reading diabetes.csv')
	with open('diabetes.csv', 'r') as data:
		reader = csv.DictReader(data)
		for row in reader:
			if row.get('FIPS', None) != None:
				sheet[row['FIPS']] = {}
				for i in range(2004, 2014):
					sheet[row['FIPS']][str(i)] = {}
					sheet[row['FIPS']][str(i)]['DiabetesPercent'] = row[str(i)]

	print('reading income.csv')
	with open('income.csv', 'r') as data:
		reader = csv.DictReader(data)
		for row in reader:
			if 'Per capita' in row['Description'] and sheet.get(row['FIPS'], None) != None:
				for i in range(2004, 2014):
					sheet[row['FIPS']][str(i)].update({'CountyName':row['GeoName'], 'FIPS':row['FIPS'], 'Year':str(i), 'PersonalIncome':row[str(i)]})

	with open('output.csv', 'w+', newline='') as out:
		writer = csv.DictWriter(out, fieldnames=sheet['1001']['2005'].keys())
		writer.writeheader()
		for row in sheet.values():
			for year in row.values():
				writer.writerow(year)
