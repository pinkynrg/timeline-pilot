from server import db
from geoalchemy2.types import Geometry

class Location(db.Model):
    __tablename__ = 'locations'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    coordinates = db.Column(Geometry(geometry_type='POINT', srid=3857))
    timestamp = db.Column(db.DateTime)

    def __repr__(self):
        return f'<Location {self.name}>'
    

# Notes:
# - db.Integer: Represents an integer type field.
# - db.String: Represents a string type field with a maximum length.
# - db.Date: Represents a date type field.
# - db.DateTime: Represents a date and time type field.
# - db.Boolean: Represents a boolean type field (True/False).
# - db.Text: Represents a long text field (unlimited length).
# - db.Float: Represents a floating-point number type field.
# - db.JSON: Represents a JSON-encoded data type field.
# - primary_key=True: Marks the field as the primary key for the table.
# - nullable=False: Ensures the field cannot be NULL (must have a value).
# - default=value: Sets a default value for the field.
# - db.func.current_timestamp(): Sets the current timestamp as the default value.