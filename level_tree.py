class Node:
    def __init__(self, val, depth):
        self.children = {}
        self.v = val
        self.count = 0
        self.depth = depth
        self.life = 0

    def add(self, path, life):
        self.count += 1
        self.life += life[0]
        if len(path) > 0 and len(life) > 0:
            if path[0] not in self.children:
                self.children[path[0]] = Node(path[0], self.depth + 1)
            self.children[path[0]].add(path[1:], life[1:])

    def __str__(self):
        out = "path: " + str(self.v) + ", count: " + str(self.count) + ", depth: " + str(self.depth) + ", avg life: " + str(self.life / self.count)
        for child in self.children:
            out += "\n" + (2*(self.depth+1))*" " + str(self.children[child])
        return out


class PathTree:
    def __init__(self):
        self.root = None

    def add(self, path, life):
        if self.root is None:
            self.root = Node(path[0], 0)
        self.root.add(path[1:], life)

    def __str__(self):
        return str(self.root)



#
# class LevelTree():
#     def __init__(self, paths, life):
#         self._user_paths = paths
#         self._user_life = life
#         self._depth = 0
#         for path in paths:
#             self._depth = max(self._depth, len(path))
#         self._tree = self.generate_tree()
