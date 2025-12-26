# Utiliser Nginx pour servir le site statique
FROM nginx:alpine

# Copier les fichiers HTML dans le répertoire de Nginx
COPY index.html /usr/share/nginx/html/
COPY test-workflow.html /usr/share/nginx/html/test.html

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
