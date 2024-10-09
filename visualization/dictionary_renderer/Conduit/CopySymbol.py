import os
import sqlite3
import json
import string
from functools import lru_cache
from typing import Dict
from shutil import copyfile
from pathlib import Path
import copy
import sqlite3


class CopyStyle(object):
    conn = None
    COLUMNS_NAMES = ["CLASS", "CATEGORY", "NAME", "TAGS", "CONTENT",
                     "KEY"]  # "ID" is the first column, should be an autonumber
    INSERT_SQL = f"INSERT INTO ITEMS({','.join(COLUMNS_NAMES)}) VALUES(?,?,?,?,?,?)"

    def __init__(self, stylex: str):
        # create a database connection
        self.style = stylex

    @staticmethod
    def _create_connection(db_file):
        """ create a database connection to the SQLite database
          specified by the db_file
            :param db_file: database file
            :return: Connection object or None
        """
        try:
            conn = sqlite3.connect(db_file)
            return conn
        except Exception as e:
            print(e)

        return None

    @lru_cache()
    def _select_all_from_table(self, conn, table_name: str):
        """
        Query all rows in the defined table
        :param conn: the Connection object
        :return:
        """
        cur = conn.cursor()
        cur.execute(f"SELECT * FROM {table_name}")

        return cur.fetchall()

    def copy_style(self, symbol_key: str, copy_count: int, out_file: str):
        copyfile(self.style, out_file)
        conn = self._create_connection(out_file)
        query_sql = f"SELECT * FROM ITEMS WHERE KEY = '{symbol_key}'"
        cur = conn.cursor()
        cur.execute(query_sql)
        exiting_symbol = cur.fetchone()
        if not exiting_symbol:
            return
        sym_cim = json.loads(exiting_symbol[5].strip('\x00'), parse_float=str)
        insert_rows = []
        for i in range(copy_count):
            new_sym = copy.deepcopy(sym_cim)
            new_sym['symbolLayers'][0]['primitiveName'] = f"{new_sym['symbolLayers'][0]['primitiveName']}_{i}"
            insert_rows.append(dict(
                CLASS=exiting_symbol[1],
                CATEGORY=exiting_symbol[2],
                NAME=exiting_symbol[3],
                TAGS=exiting_symbol[4],
                CONTENT=sqlite3.Binary(json.dumps(new_sym).encode()),
                KEY=f"{exiting_symbol[6]}_{i}"))
        insert_rows = [tuple(row.values()) for row in insert_rows]
        cur.executemany(self.INSERT_SQL, insert_rows)
        cur.close()
        conn.commit()
        conn.close()


if __name__ == "__main__":
    key_to_copy = 'ConduitPoint'
    source_style = r"C:\_MyFiles\github\arcade-expressions\dictionary_renderer\Conduit\base_symbol.stylx"
    output_style = r"C:\_MyFiles\github\arcade-expressions\dictionary_renderer\Conduit\ConduitKnockouts.stylx"
    num_copies = 1000
    CopyStyle(source_style).copy_style(key_to_copy, num_copies, output_style)
