# Deployment Guide

## Production Deployment with Docker

### Requirements
- Docker and Docker Compose installed
- At least 2GB RAM available
- Ports 3000 and 5987 available

### Quick Start

1. **Clone and navigate to the project:**
   ```bash
   cd nomina-app
   ```

2. **Build and start the services:**
   ```bash
   docker-compose up -d --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5987

### Environment Configuration

For production, create a `.env` file:

```bash
# Backend Environment Variables
NODE_ENV=production
PORT=5987
```

### Health Checks

Check if services are running:
```bash
docker-compose ps

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Scaling and Load Balancing

For higher traffic, you can scale the backend:

```bash
docker-compose up -d --scale backend=3
```

### Backup and Recovery

Important data to backup:
- `./backend/uploads/` directory (temporary uploaded files)
- Database (if external database is configured)

### Security Considerations

1. **Change default ports** in docker-compose.yml if needed
2. **Configure firewall** to only allow necessary ports
3. **Use HTTPS** in production with reverse proxy (nginx/traefik)
4. **Regular updates** of base Docker images

### Monitoring

Monitor resource usage:
```bash
docker stats
```

### Troubleshooting

Common issues and solutions:

1. **Port conflicts:** Change ports in docker-compose.yml
2. **Permission issues:** Ensure proper file permissions for uploads directory
3. **Memory issues:** Increase Docker memory allocation
4. **Service not starting:** Check logs with `docker-compose logs`

### Production Optimizations

1. **Use Redis** for caching if needed
2. **Configure persistent storage** for uploads
3. **Set up log rotation** to prevent disk space issues
4. **Monitor and restart** failed services automatically