import csv
import numpy as np
import data_util
import level_tree


users = {}
users_list = []

# Read in Data #
####################################################################
with open('skills-paths.csv') as pathsfile:
    pathsreader = csv.reader(pathsfile, skipinitialspace=True)
    for row in pathsreader:
        users[row[0]] = {'paths': [int(s) for s in (row[1:][0]).split(',')]}
        users[row[0]]['id'] = row[0]

with open('skills-scores.csv') as scoresfile:
    scoresreader = csv.reader(scoresfile, skipinitialspace=True)
    for row in scoresreader:
        users[row[0]]['scores'] = [float(s) for s in (row[1:][0]).split(',')]

with open('skills-sequences.csv') as sequencesfile:
    sequencereader = csv.reader(sequencesfile, skipinitialspace=True)
    for row in sequencereader:
        users[row[0]]['set'] = int(row[1])
        users[row[0]]['blue'] = [int(s) for s in row[2].split(',')]
        users[row[0]]['green'] = [int(s) for s in row[3].split(',')]
        users[row[0]]['red'] = [int(s) for s in row[4].split(',')]
        users[row[0]]['orange'] = [int(s) for s in row[5].split(',')]
        users[row[0]]['purple'] = [int(s) for s in row[6].split(',')]
######################################################################

# Takes a vector of scores and returns a vector of life remaining
def calculate_life(scores):
    total_life = 100
    life = [total_life]
    for score in scores:
        total_life += 15
        total_life -= score
        life.append(total_life)
    return life

# Generate features
for key in list(users.keys()):
    user_data = users[key]
    scores = user_data['scores']
    paths = user_data['paths']
    if (len(scores) == len(paths) or len(scores) == (len(paths)-1)) and \
                    len(paths) <= len(data_util.get_level_encoding(user_data['set'])):
        users_list.append(user_data)
print(len(users_list))
treeA = level_tree.PathTree()
treeB = level_tree.PathTree()
treeC = level_tree.PathTree()
treeD = level_tree.PathTree()

level_list = []

for user in users_list:
    data_util.split_user_data(user, level_list)
#     if user['set'] == 0:
#         treeA.add(user['paths'], calculate_life(user['scores']))
#     elif user['set'] == 1:
#         treeB.add(user['paths'], calculate_life(user['scores']))
#     elif user['set'] == 2:
#         treeC.add(user['paths'], calculate_life(user['scores']))
#     else:
#         treeD.add(user['paths'], calculate_life(user['scores']))
# print("TREE A")
# print(treeA)
# print("TREE B")
# print(treeB)
# print("TREE C")
# print(treeC)
# print("TREE D")
# print(treeD)
#

print(len(level_list))




# FIT LINEAR MODEL TO FEATURES #
#####################################################################
# Parse Features
level_targets = []
level_features = []
for level in level_list:
    level_feature = []
    if level['path_taken']:
        level_targets.append(1)
    else:
        level_targets.append(0)
    level_feature.append(level['path_var'])
    level_feature.append(level['complexity'])
    level_feature.append(level['expected_cost_disadvantage'])
    level_feature.append(level['path_std'])
    level_feature.append(level['unknown_path_var'])
    level_feature.append(level['expected_path_length'])
    level_feature.append(level['remaining_life'])
    level_feature.append(level['unknown_path_length'])
    level_feature.append(level['known_path_length'])
    level_feature.append(level['expected_cost_disadvantage_with_hindsight'])
    level_feature.append(level['ideal_cost_disadvantage'])
    level_feature.append(level['complexity_disadvantage'])
    level_feature.append(level['unknown_path_std'])
    level_feature.append(1.0)
    level_features.append(level_feature)

b = np.asarray(level_targets).reshape(len(level_targets), 1)
A = np.asarray(level_features)

theta = np.linalg.lstsq(A, b)
print(theta[0])
print(theta[2])
# print(theta)
err = np.dot(A, theta[0])-b
print(np.sum(abs(err)) / len(level_list))
mse = np.dot(err.T, err) / len(level_list)
print(mse)
# print(np.linalg.norm(np.dot(A, theta)-b))
#####################################################################