class Segmentation:
    def translate(self, table, segment, offset):
        if segment >= len(table):
            return "Invalid Segment"

        base, limit = table[segment]

        if offset >= limit:
            return "Segmentation Fault"

        return base + offset