import cloudinary.uploader


async def upload_image(file):
    result = cloudinary.uploader.upload(
        file.file,
        folder="peripheralstalk"
    )

    return {
        "url": result["secure_url"],
        "public_id": result["public_id"]
    }