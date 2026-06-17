from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/comment", tags=["comment"])

@router.post("/{article_id}")
async def create_comment(article_id: int):
    return {
        "message": "Not implemented yet"
    }

@router.get("/{article_id}")
async def get_comments(article_id: int):
    return {
        "message": "Not implemented yet"
    }

@router.post("/{comment_id}")
async def create_nested_comment(comment_id: int):
    return {
        "message": "Not implemented yet"
    }

@router.delete("/{comment_id}")
async def delete_comment(comment_id: int):
    return {
        "message": "Not implemented yet"
    }

@router.put("/{comment_id}")
async def update_comment(comment_id: int):
    return {
        "message": "Not implemented yet"
    }

@router.post("/{comment_id}/up-vote")
async def up_vote_comment(comment_id: int):
    # up vote a comment
    return {
        "message": "Not implemented yet"
    }

@router.post("/{comment_id}/down-vote")
async def down_vote_comment(comment_id: int):
    # down vote a comment
    return {
        "message": "Not implemented yet"
    }

@router.post("/{comment_id}/report")
async def report_comment(comment_id: int):
    # report a comment
    return {
        "message": "Not implemented yet"
    }