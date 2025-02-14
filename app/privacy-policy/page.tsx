import { Markdown } from "../components/markdown";
import Link from "next/link";
export default function PrivacyPolicy() {
  const contactEmail = "hugo.dorus@epitech.digital";

  return (
    <div className="flex flex-col   p-20">
      <Link href="/" className="text-black underline">
        Retour
      </Link>
      <Markdown>
        {`
# Politique de Protection des Données Personnelles LifeAI

**Dernière mise à jour :** 13/02/2025

Bienvenue sur LifeAI. La protection de vos données personnelles est une priorité pour nous. Cette politique de protection des données explique comment nous collectons, utilisons et protégeons vos informations personnelles.

## 1. Responsable du Traitement des Données
Le responsable du traitement des données est :  
Hugo DORUS  
Email : ${contactEmail}

## 2. Données Collectées
Nous collectons uniquement les données nécessaires au bon fonctionnement de notre application :
- Aucune donnée personnelle identifiable n'est collectée
- Nous ne collectons que les notations des réponses, sans possibilité d'identifier un utilisateur spécifique
- Nous ne collectons pas de données sensibles ni d'informations permettant d'identifier un utilisateur

## 3. Finalité de la Collecte
Vos données sont utilisées uniquement pour :
- Analyser l'évolution des réponses de manière anonyme afin d'améliorer l'expérience utilisateur
- Optimiser les performances de l'application

## 4. Conservation des Données
Les notations des réponses sont conservées anonymement et ne sont associées à aucun utilisateur. Vous ne pouvez donc pas demander la suppression de toute donnée associée à votre utilisation de l'application.

## 5. Partage des Données
Nous ne vendons ni ne partageons vos données personnelles avec des tiers à des fins commerciales. Les données sont stockées via Firebase, qui assure un haut niveau de sécurité et de confidentialité.

## 6. Sécurité des Données
Nous mettons en place des mesures de sécurité adaptées pour protéger les données stockées contre les accès non autorisés, la perte ou la modification. Cela inclut :
- Stockage sécurisé sur Firebase
- Accès restreint aux bases de données
- Protection contre toute tentative d'identification des utilisateurs

## 7. Vos Droits
Conformément au RGPD et autres réglementations en vigueur, vous avez les droits suivants :
- **Accès :** Consulter les données générales collectées (sans identifiant personnel)
- **Suppression :** Demander la suppression de toute donnée stockée vous concernant

## 8. Suppression des Données
Puisque nous ne collectons aucune donnée personnelle, il n'est pas possible de retrouver et de supprimer une donnée individuelle. Toutefois, vous pouvez nous contacter pour toute demande concernant la gestion de vos interactions anonymes.

## 9. Cookies et Suivi
Nous n'utilisons pas de cookies ni de technologies de suivi sur notre site.

## 10. Modification de cette Politique
Nous pouvons mettre à jour cette politique pour refléter les évolutions réglementaires ou fonctionnelles de l'application. Une version archivée des anciennes politiques de protection des données est disponible pour consultation.

**Contact :**  
Pour toute question ou demande concernant vos données personnelles, vous pouvez nous contacter à :  
${contactEmail}
      `}
      </Markdown>
    </div>
  );
}
