class Paging:
    def fifo(self, pages, frames):
        memory = []
        faults = 0
        history = []

        for page in pages:
            if page not in memory:
                if len(memory) < frames:
                    memory.append(page)
                else:
                    memory.pop(0)
                    memory.append(page)
                faults += 1
            history.append(memory.copy())

        return history, faults

    def lru(self, pages, frames):
        memory = []
        faults = 0
        history = []

        for i, page in enumerate(pages):
            if page not in memory:
                if len(memory) < frames:
                    memory.append(page)
                else:
                    lru_index = min(range(len(memory)),
                        key=lambda x: pages[:i][::-1].index(memory[x]))
                    memory[lru_index] = page
                faults += 1
            history.append(memory.copy())

        return history, faults