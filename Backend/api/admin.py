from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])

@router.get("/get-editor-request")
async def get_editor_request():
    return {
        "message": "Not implemented yet"
    }

@router.post("/make-editor/{user_id}")
async def make_editor(user_id: int):
    return {
        "message": "Not implemented yet"
    }

@router.post("/revoke-editor/{user_id}")
async def revoke_editor(user_id: int):
    return {
        "message": "Not implemented yet"
    }

@router.post("/suspend-user/{user_id}")
async def suspend_user(user_id: int):
    return {
        "message": "Not implemented yet"
    }

@router.post("/unsuspend-user/{user_id}")
async def unsuspend_user(user_id: int):
    return {
        "message": "Not implemented yet"
    }

@router.get("/all-report")
async def get_all_report():
    return {
        "message": "Not implemented yet"
    }

@router.post("/resolve-report/{report_id}")
async def resolve_report(report_id: int):
    # update status as solved where default is unsolved
    return {
        "message": "Not implemented yet"
    }

@router.get("/get-user-by-comment/{comment_id}")
async def get_user_by_comment(comment_id: int):
    return {
        "message": "Not implemented yet"
    }

@router.post("/reset-user-password/{user_id}")
async def reset_user_password(user_id: int):
    return {
        "message": "Not implemented yet"
    }