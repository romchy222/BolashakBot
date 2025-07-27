{ pkgs }: {
  deps = [
    pkgs.python310
    pkgs.python310Packages.flask
    pkgs.python310Packages.flask-sqlalchemy
    pkgs.python310Packages.alembic
    pkgs.python310Packages.flask-migrate
    pkgs.python310Packages.pip
    pkgs.python310Packages.psycopg2
    pkgs.postgresql
  ];
}
