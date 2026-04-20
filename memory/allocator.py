class MemoryAllocator:
    def __init__(self, size):
        self.size = size
        self.memory = [None] * size
        self.process_counter = 1
        self.last_index = 0

    def allocate(self, size, strategy):
        pid = f"P{self.process_counter}"

        if strategy == "first":
            index = self.first_fit(size)
        elif strategy == "best":
            index = self.best_fit(size)
        elif strategy == "worst":
            index = self.worst_fit(size)
        elif strategy == "next":
            index = self.next_fit(size)
        else:
            return False, "Invalid"

        if index == -1:
            return False, "Allocation Failed"

        for i in range(index, index + size):
            self.memory[i] = pid

        self.process_counter += 1
        return True, pid

    def first_fit(self, size):
        for i in range(self.size - size + 1):
            if all(self.memory[j] is None for j in range(i, i + size)):
                return i
        return -1

    def best_fit(self, size):
        best, best_i = float('inf'), -1
        i = 0
        while i < self.size:
            if self.memory[i] is None:
                j = i
                while j < self.size and self.memory[j] is None:
                    j += 1
                hole = j - i
                if size <= hole < best:
                    best, best_i = hole, i
                i = j
            else:
                i += 1
        return best_i

    def worst_fit(self, size):
        worst, worst_i = -1, -1
        i = 0
        while i < self.size:
            if self.memory[i] is None:
                j = i
                while j < self.size and self.memory[j] is None:
                    j += 1
                hole = j - i
                if hole >= size and hole > worst:
                    worst, worst_i = hole, i
                i = j
            else:
                i += 1
        return worst_i

    def next_fit(self, size):
        n = self.size
        for i in range(n):
            idx = (self.last_index + i) % n
            if idx + size <= n and all(self.memory[j] is None for j in range(idx, idx + size)):
                self.last_index = idx + size
                return idx
        return -1

    def deallocate(self, pid):
        self.memory = [None if x == pid else x for x in self.memory]

    def stats(self):
        used = sum(1 for x in self.memory if x)
        free = self.size - used
        return {"total": self.size, "used": used, "free": free}