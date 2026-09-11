-- PostgreSQL コンテナの初回起動時にだけ実行される（docker-entrypoint-initdb.d）。
-- api（taskboard）と ai（taskboard_ai）は同じインスタンスの別データベースを使う。
-- サービスごとにデータベースを分けるのは、スキーマの所有者を明確にし、片方の変更が他方に波及しないようにするため。
CREATE DATABASE taskboard_ai;
