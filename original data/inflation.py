# Multiplier to adjust to 2013 dollars, courtesy of http://www.in2013dollars.com/2004-dollars-in-2013?amount=100
# 2004: 1.2332
# 2005: 1.1928
# 2006: 1.1555
# 2007: 1.1235
# 2008: 1.0820
# 2009: 1.0859
# 2010: 1.0683
# 2011: 1.0356
# 2012: 1.0146

'''
CountyName | FIPS | Year | PersonalIncome | DiabetesPercent

2004-2013

'''

import csv

lookup = {
    '2004':1.2332,
    '2005':1.1928,
    '2006':1.1555,
    '2007':1.1235,
    '2008':1.0820,
    '2009':1.0859,
    '2010':1.0683,
    '2011':1.0356,
    '2012':1.0146,
}

if __name__ == '__main__':
    sheet = []

    with open('output.csv', 'r') as data:
        reader = csv.DictReader(data)
        for row in reader:
            if row['Year'] in lookup.keys() and row['PersonalIncome'] != "(NA)":
                updated = round(int(row['PersonalIncome']) * lookup[row['Year']])
                sheet.append({'CountyName':row['CountyName'], 'FIPS':row['FIPS'], 'Year':row['Year'], 'PersonalIncome':updated, 'DiabetesPercent':row['DiabetesPercent']})
            else:
                sheet.append(row)

    with open('data.csv', 'w+', newline='') as out:
        writer = csv.DictWriter(out, fieldnames=sheet[1].keys())
        writer.writeheader()
        for row in sheet:
            writer.writerow(row)
