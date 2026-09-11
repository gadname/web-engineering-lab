from uuid import uuid4

from httpx import ASGITransport, AsyncClient

from src.main import app


class TestApp:
    """ミドルウェアの配線だけを確認する（DB は使わない。lifespan は起動しない）."""

    async def test_healthは認証なしで200(self) -> None:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.get("/health")
        assert res.status_code == 200
        assert res.json() == {"status": "ok"}
        assert "x-trace-id" in res.headers

    async def test_認証なしで保護ルートは401でapiと同じ形(self) -> None:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.get(f"/api/ai/v1/protected/summary-jobs/{uuid4()}")
        assert res.status_code == 401
        assert res.json() == {
            "statusCode": 401,
            "errorCode": "USER.LOGIN.NOT_AUTHENTICATED",
            "message": "認証されていません。再度ログインしてください",
        }

    async def test_テナントヘッダがなければ400(self) -> None:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.get(
                f"/api/ai/v1/protected/summary-jobs/{uuid4()}", headers={"Authorization": "Bearer dev-user"}
            )
        assert res.status_code == 400
        assert res.json()["errorCode"] == "VALIDATION.REQUEST.TENANT_HEADER_MISSING"

    async def test_本文の形が不正なら422でissuesが入る(self) -> None:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            res = await client.post(
                "/api/ai/v1/protected/summary-jobs",
                headers={"Authorization": "Bearer dev-user", "X-Tenant-ID": str(uuid4())},
                json={"projectId": "not-a-uuid", "text": ""},
            )
        assert res.status_code == 422
        body = res.json()
        assert body["errorCode"] == "VALIDATION.REQUEST.INVALID"
        assert {i["path"] for i in body["details"]["issues"]} == {"projectId", "text"}
