export PROJECT_ID="gemini-looker-demo-dataset"
export TOOLBOX_SA="global-gadgets-ti"
export IMAGE=us-central1-docker.pkg.dev/database-toolbox/toolbox/toolbox:latest
export TOOLS_BUCKET=global-gadgets-mcp-tools
export MCP_PORT=8080

gcloud iam service-accounts create $TOOLBOX_SA


gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member serviceAccount:$TOOLBOX_SA@$PROJECT_ID.iam.gserviceaccount.com \
    --role roles/secretmanager.secretAccessor

gcloud run deploy global-gadgets-mcp-toolbox \
    --image $IMAGE \
    --service-account $TOOLBOX_SA \
    --env-vars-file=deploy.env \
    --region us-east4 \
    --add-volume name=toolbox-config,type=cloud-storage,bucket=$TOOLS_BUCKET \
    --add-volume-mount volume=toolbox-config,mount-path=/app/tools \
    --args="--tools-folder=/app/tools","--address=0.0.0.0","--port=$MCP_PORT"