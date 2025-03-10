import uuid


class ImportTask:

    def __init__(self, url: str):
        # autogenerate id
        self.id = uuid.uuid4()
        # progress in percentage
        self.progress = 0
        # url to resource
        self.url = url

    def execute(self):
        # do stuff
        return None