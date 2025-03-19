from typing import Annotated

from datastew.visualisation import get_plot_for_current_database_state
from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse

from api.dependencies import get_client
from api.models import WeaviateClient

router = APIRouter(prefix="/visualization", tags=["visualization"], dependencies=[Depends(get_client)])

db_plot_html = None


@router.get("/", response_class=HTMLResponse)
def serve_visualization(client: Annotated[WeaviateClient, Depends(get_client)]):
    global db_plot_html
    if not db_plot_html:
        db_plot_html = get_plot_for_current_database_state(client)
    return db_plot_html


@router.patch("/")
def update_visualization(client: Annotated[WeaviateClient, Depends(get_client)]):
    global db_plot_html
    db_plot_html = get_plot_for_current_database_state(client)
    return {"message": "DB visualization plot has been updated successfully"}
