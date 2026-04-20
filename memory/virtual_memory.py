class VirtualMemory:
    def translate(self, logical_address, page_size, page_table):
        page = logical_address // page_size
        offset = logical_address % page_size

        if page >= len(page_table):
            return {"error": "Invalid Page"}

        frame = page_table[page]

        if frame == -1:
            return {"error": "Page Fault"}

        physical_address = frame * page_size + offset

        return {
            "page": page,
            "offset": offset,
            "frame": frame,
            "physical_address": physical_address
        }