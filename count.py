import json

with open('output') as file: 
    plainData = file.readlines()
logData = []
for plainJson in plainData:
    try:
        logData.append(json.loads(plainJson))
    except:
        print("Bad Json: " + plainJson)
res = {}
for log in logData:
    if 'traceId' in log:
        traceId = log['traceId']
        if traceId in res:
            res[traceId] = res[traceId] + 1
        else:
            res[traceId] = 1
    else:
        print("Error Request")
        print(json.dumps(log))
for traceId in res.keys():
    count = res[traceId]
    if count > 3:
        print("Fail algoritm")

print("success algoritm")