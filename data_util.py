import numpy as np
import copy
from collections import deque

# Splits user data into featurized data points for each level
# user_data: The user data to be split
# data_list: The list of featurized level data to append to
def split_user_data(user, level_data_list):
    paths_taken = user['paths']
    scores = user['scores']
    remaining_life = calculate_life(scores)
    level_set = user['set']
    level_encoding = get_level_encoding(level_set)
    num_levels = min(len(paths_taken), len(level_encoding))

    sequences = {
        'blue': user['blue'],
        'red': user['red'],
        'orange': user['orange'],
        'purple': user['purple'],
        'green': user['green']
    }

    blocks_visited = {
        'blue': False,
        'red': False,
        'purple': False,
        'green': False,
        'orange': False
    }
    blocks_known = {
        'blue': False,
        'red': False,
        'purple': False,
        'green': False,
        'orange': False
    }
    blocks_known_memory_queue = deque()
    accumulated_block_hindsight = {
        'blue': 0,
        'red': 0,
        'purple': 0,
        'green': 0,
        'orange': 0,
        'skip': 0
    }
    for l in range(num_levels):
        list_of_path_features = []
        acquired_blocks = set()
        for p in range(len(level_encoding[l])):
            path = level_encoding[l][p]
            path_features = {}
            path_known = True
            distinct_blocks = set(path)
            if 'skip' in distinct_blocks:
                distinct_blocks.remove('skip')
            if paths_taken[l] == p:
                acquired_blocks = distinct_blocks
            skills_known = copy.deepcopy(blocks_known)
            for block in distinct_blocks:
                if not skills_known[block]:
                    path_known = False
            path_features['path_known'] = path_known
            path_features['distinct_blocks'] = distinct_blocks
            path_features['blocks_visited'] = copy.deepcopy(blocks_visited)
            path_features['blocks_known'] = copy.deepcopy(blocks_known)
            path_features['known_path_length'] = known_path_length(path)
            path_features['unknown_path_length'] = unknown_path_length(path)
            path_features['unknown_path_var'] = unknown_path_var(path)
            path_features['unknown_path_std'] = np.sqrt(path_features['unknown_path_var'])
            path_features['expected_path_length'] = expected_path_length(path, skills_known, distinct_blocks)['all']
            path_features['path_var'] = path_var(path, skills_known)
            path_features['path_std'] = np.sqrt(path_features['path_var'])
            path_features['path_taken'] = (paths_taken[l] == p)
            path_features['remaining_life'] = remaining_life[l]
            path_features['complexity'] = calculate_complexity(distinct_blocks, sequences)
            list_of_path_features.append(path_features)
        disadvantage_metrics = calculate_disadvantage_metrics(list_of_path_features, accumulated_block_hindsight)
        for path_features, disadvantage in zip(list_of_path_features, disadvantage_metrics['expected_cost_disadvantages']):
            path_features['expected_cost_disadvantage'] = disadvantage
        for path_features, disadvantage in zip(list_of_path_features, disadvantage_metrics['ideal_cost_disadvantages']):
            path_features['ideal_cost_disadvantage'] = disadvantage
        for path_features, disadvantage in zip(list_of_path_features, disadvantage_metrics['complexity_disadvantages']):
            path_features['complexity_disadvantage'] = disadvantage
        for path_features, disadvantage in zip(list_of_path_features, disadvantage_metrics['expected_cost_disadvantages_with_hindsight']):
            path_features['expected_cost_disadvantage_with_hindsight'] = disadvantage

        # Update visited blocks
        for block in acquired_blocks:
            blocks_visited[block] = True
            accumulated_block_hindsight[block] = 0
            if block not in blocks_known_memory_queue:
                blocks_known_memory_queue.append(block)
        while len(blocks_known_memory_queue) > 5:
            blocks_known_memory_queue.popleft()
        for block in blocks_known:
            if block in blocks_known_memory_queue:
                blocks_known[block] = True
            else:
                blocks_known[block] = False
        level_data_list += list_of_path_features


# Calculate disadvantage metrics of taking a particular path
def calculate_disadvantage_metrics(list_of_path_features, accumulated_block_hindsight):
    expected_costs = [path_features['expected_path_length'] for path_features in list_of_path_features]
    ideal_costs = [path_features['known_path_length'] for path_features in list_of_path_features]
    path_complexities = [path_features['complexity'] for path_features in list_of_path_features]
    min_expected_cost = min(expected_costs)
    min_complexity = min(path_complexities)

    expected_cost_disadvantages = [expected_cost - min_expected_cost for expected_cost in expected_costs]
    ideal_cost_disadvantages = [ideal_cost - min_expected_cost for ideal_cost in ideal_costs]
    min_possible_path_score = min(ideal_cost_disadvantages)
    optimal_path = list_of_path_features[ideal_cost_disadvantages.index(min_possible_path_score)]

    complexity_disadvantages = [path_complexity - min_complexity for path_complexity in path_complexities]
    expected_cost_disadvantages_with_hindsight = []
    for path_features, expected_cost_disadvantage in zip(list_of_path_features, expected_cost_disadvantages):
        expected_cost_disadvantage_with_hindsight = expected_cost_disadvantage
        distinct_blocks = path_features['distinct_blocks']
        for block in distinct_blocks:
            expected_cost_disadvantage_with_hindsight += accumulated_block_hindsight[block]
        expected_cost_disadvantages_with_hindsight.append(expected_cost_disadvantage_with_hindsight)
    distinct_optimal_blocks = optimal_path['distinct_blocks']
    if not optimal_path['path_taken']:
        for block in distinct_optimal_blocks:
            # if not optimal_path['blocks_visited'][block]:
            if not optimal_path['blocks_known'][block]:
                accumulated_block_hindsight[block] += knowledge_benefit(block)

    return {'expected_cost_disadvantages': expected_cost_disadvantages,
            'expected_cost_disadvantages_with_hindsight': expected_cost_disadvantages_with_hindsight,
            'ideal_cost_disadvantages': ideal_cost_disadvantages,
            'complexity_disadvantages': complexity_disadvantages}


# Return benefit of knowing block
def knowledge_benefit(block):
    if block == 'blue':
        return -9
    elif block == 'red' or block == 'purple':
        return -15
    else:
        return -22.5


# Calculate the complexity of a path, which is the sum of the empirical entropy of all distinct block.
def calculate_complexity(distinct_blocks, sequences):
    complexity = 0
    for block in distinct_blocks:
        if block != 'skip':
            complexity += empirical_entropy(sequences[block])
    return complexity


# Calculate the empirical entropy of a sequence
def empirical_entropy(sequence):
    occurrences = {}
    entropy = 0
    for symbol in set(sequence):
        occurrences[symbol] = 0
    for symbol in sequence:
        occurrences[symbol] += 1
    for p in list(occurrences.keys()):
        prob = occurrences[p] / len(sequence)
        entropy += prob * np.log2(1.0/prob)
    return entropy


# Takes a vector of scores and returns a vector of life remaining
def calculate_life(scores):
    total_life = 100
    life = [total_life]
    for score in scores:
        total_life += 15
        total_life -= score
        life.append(total_life)
    return life


# Returns the length of a path assuming perfect knowledge and execution of skills
def known_path_length(path):
    length = 0
    for block in path:
        if block == 'blue':
            length += 3
        elif block == 'red':
            length += 4
        elif block == 'orange':
            length += 5
        elif block == 'purple':
            length += 4
        elif block == 'green':
            length += 5
    return length


# Returns the expected path length assuming completely unknown skills and perfect strategy.
def unknown_path_length(path):
    length = 0
    seen_blocks = {
        'blue': False,
        'red': False,
        'green': False,
        'orange': False,
        'purple': False
    }
    for block in path:
        if block == 'blue':
            if seen_blocks[block]:
                length += 3
            else:
                length += 12
                seen_blocks[block] = True
        elif block == 'red':
            if seen_blocks[block]:
                length += 4
            else:
                length += 19
                seen_blocks[block] = True
        elif block == 'orange':
            if seen_blocks[block]:
                length += 5
            else:
                length += 27.5
                seen_blocks[block] = True
        elif block == 'purple':
            if seen_blocks[block]:
                length += 4
            else:
                length += 19
                seen_blocks[block] = True
        elif block == 'green':
            if seen_blocks[block]:
                length += 5
            else:
                length += 27.5
                seen_blocks[block] = True
    return length


# Returns the variance in path length assuming completely unknown skills and perfect strategy.
def unknown_path_var(path):
    var = 0
    seen_blocks = {
        'blue': False,
        'red': False,
        'green': False,
        'orange': False,
        'purple': False
    }
    for block in path:
        if block == 'blue':
            if seen_blocks[block]:
                var += 0
            else:
                var += 17.5
                seen_blocks[block] = True
        elif block == 'red':
            if seen_blocks[block]:
                var += 0
            else:
                var += 37.5
                seen_blocks[block] = True
        elif block == 'orange':
            if seen_blocks[block]:
                var += 0
            else:
                var += 68.75
                seen_blocks[block] = True
        elif block == 'purple':
            if seen_blocks[block]:
                var += 0
            else:
                var += 37.5
                seen_blocks[block] = True
        elif block == 'green':
            if seen_blocks[block]:
                var += 0
            else:
                var += 68.75
                seen_blocks[block] = True
    return var


# Returns the expected path length assuming perfect execution on known skills perfect strategy on unknown skills .
def expected_path_length(path, blocks_known, distinct_blocks):
    length = {'all': 0}
    known = copy.deepcopy(blocks_known)
    for block in distinct_blocks:
        length[block] = 0
    for block in path:
        if block == 'blue':
            if known[block]:
                length['all'] += 3
                for distinct in distinct_blocks:
                    length[distinct] += 3
            else:
                length['all'] += 12
                for distinct in distinct_blocks:
                    if distinct == 'blue':
                        length[distinct] += 3
                    else:
                        length[distinct] += 12
                known[block] = True
        elif block == 'red':
            if known[block]:
                length['all'] += 4
                for distinct in distinct_blocks:
                    length[distinct] += 4
            else:
                length['all'] += 19
                for distinct in distinct_blocks:
                    if distinct == 'red':
                        length[distinct] += 4
                    else:
                        length[distinct] += 19
                known[block] = True
        elif block == 'orange':
            if known[block]:
                length['all'] += 5
                for distinct in distinct_blocks:
                    length[distinct] += 5
            else:
                length['all'] += 27.5
                for distinct in distinct_blocks:
                    if distinct == 'orange':
                        length[distinct] += 5
                    else:
                        length[distinct] += 27.5
                known[block] = True
        elif block == 'purple':
            if known[block]:
                length['all'] += 4
                for distinct in distinct_blocks:
                    length[distinct] += 4
            else:
                length['all'] += 19
                for distinct in distinct_blocks:
                    if distinct == 'purple':
                        length[distinct] += 4
                    else:
                        length[distinct] += 19
                known[block] = True
        elif block == 'green':
            if known[block]:
                length['all'] += 5
                for distinct in distinct_blocks:
                    length[distinct] += 5
            else:
                length['all'] += 27.5
                for distinct in distinct_blocks:
                    if distinct == 'green':
                        length[distinct] += 5
                    else:
                        length[distinct] += 27.5
                known[block] = True
    return length


# Returns the variance in path length assuming perfect strategy on unknown blocks and perfect execution on known.
def path_var(path, blocks_known):
    known = copy.deepcopy(blocks_known)
    var = 0
    for block in path:
        if block == 'blue':
            if known[block]:
                var += 0
            else:
                var += 17.5
            known[block] = True
        elif block == 'red':
            if known[block]:
                var += 0
            else:
                var += 37.5
            known[block] = True
        elif block == 'orange':
            if known[block]:
                var += 0
            else:
                var += 68.75
            known[block] = True
        elif block == 'purple':
            if known[block]:
                var += 4
            else:
                var += 37.5
            known[block] = True
        elif block == 'green':
            if known[block]:
                var += 0
            else:
                var += 68.75
            known[block] = True
    return var

# Returns level encodings depending on
def get_level_encoding(level_set):
    levels = []
    if level_set == 0:
        level0 = [['blue', 'blue', 'blue'], ]
        level1 = [['blue', 'blue', 'blue'],
                  ['red', 'skip', 'red']]
        level2 = [['blue', 'blue', 'blue', 'blue', 'blue'],
                  ['red', 'skip', 'skip', 'skip', 'red']]
        level3 = [['blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue'],
                  ['red', 'skip', 'skip', 'skip', 'skip', 'skip', 'skip', 'red']]
        level4 = [['purple', 'purple', 'purple'],
                  ['green', 'skip', 'green']]
        level5 = [['blue', 'green', 'blue'],
                  ['purple', 'red', 'red']]
        level6 = [['blue', 'blue', 'blue', 'blue'],
                  ['red', 'red', 'skip', 'red']]
        level7 = [['orange', 'blue', 'blue'],
                  ['orange', 'red', 'red']]
        levels = [level0, level1, level2, level3, level4, level5, level6, level7]
    elif level_set == 1:
        level0 = [['red', 'red', 'red'], ];
        level1 = [['red', 'red', 'red', 'red', 'red', 'red'],
                  ['blue', 'skip', 'skip', 'skip', 'skip', 'blue']]
        level2 = [['blue', 'blue', 'blue', 'blue', 'blue'],
                  ['red', 'red', 'red', 'red', 'red'],
                  ['orange', 'skip', 'skip', 'skip', 'orange']]
        level3 = [['purple', 'purple', 'purple'],
                  ['green', 'skip', 'green']]
        level4 = [['red', 'red', 'red', 'red', 'red', 'red'],
                  ['blue', 'skip', 'skip', 'skip', 'skip', 'blue']]
        level5 = [['blue', 'blue', 'blue', 'blue', 'blue', 'blue'],
                  ['red', 'skip', 'skip', 'skip', 'skip', 'red']]
        level6 = [['blue', 'blue', 'skip', 'blue', 'blue'],
                  ['green', 'skip', 'skip', 'skip', 'green'],
                  ['red', 'red', 'skip', 'red', 'red']]
        levels = [level0, level1, level2, level3, level4, level5, level6]
    elif level_set == 2:
        level0 = [['blue', 'blue', 'blue'], ]
        level1 = [['blue', 'blue', 'blue', 'blue', 'blue'],
                  ['red', 'skip', 'skip', 'skip', 'red']]
        level2 = [['orange', 'skip', 'skip', 'skip', 'orange'],
                  ['blue', 'blue', 'blue', 'blue', 'blue']]
        level3 = [['blue', 'blue', 'blue'],
                  ['red', 'skip', 'red']]
        level4 = [['blue', 'blue', 'red', 'blue', 'blue'],
                  ['blue', 'skip', 'orange', 'skip', 'blue']]
        level5 = [['purple', 'red', 'skip', 'red', 'purple'],
                  ['orange', 'skip', 'blue', 'skip', 'orange']]
        level6 = [['blue', 'blue', 'blue', 'blue', 'blue'],
                  ['red', 'skip', 'skip', 'skip', 'red']]
        levels = [level0, level1, level2, level3, level4, level5, level6]
    elif level_set == 3:
        level0 = [['blue', 'blue', 'blue'], ]
        level1 = [['blue', 'blue', 'blue', 'blue', 'blue'],
                  ['red', 'skip', 'skip', 'skip', 'red']]
        level2 = [['green', 'skip', 'skip', 'skip', 'skip', 'skip', 'green'],
                  ['blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue']]
        level3 = [['blue', 'blue', 'blue', 'blue', 'blue'],
                  ['red', 'skip', 'skip', 'skip', 'red']]
        level4 = [['red', 'blue', 'red', 'blue', 'red'],
                  ['green', 'green', 'green', 'green', 'green']]
        level5 = [['red', 'blue', 'red', 'blue', 'red', 'blue', 'red', 'blue'],
                  ['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green']]
        level6 = [['red', 'red', 'skip', 'skip', 'skip', 'red', 'red'],
                  ['blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue'],
                  ['green', 'skip', 'skip', 'skip', 'skip', 'skip', 'green']]
        levels = [level0, level1, level2, level3, level4, level5, level6]
    return levels
